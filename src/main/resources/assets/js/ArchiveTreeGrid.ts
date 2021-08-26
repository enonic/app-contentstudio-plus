import * as Q from 'q';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ArchiveTreeGridHelper} from './ArchiveTreeGridHelper';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {ArchiveTreeGridActions} from './ArchiveTreeGridActions';
import {ArchiveViewItem} from './ArchiveViewItem';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveBundleViewItem, ArchiveBundleViewItemBuilder} from './ArchiveBundleViewItem';
import {ArchiveContentViewItem, ArchiveContentViewItemBuilder} from './ArchiveContentViewItem';
import {ContentResponse} from 'lib-contentstudio/app/resource/ContentResponse';
import {GetContentByPathRequest} from 'lib-contentstudio/app/resource/GetContentByPathRequest';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ListContentByIdRequest} from 'lib-contentstudio/app/resource/ListContentByIdRequest';
import {Content} from 'lib-contentstudio/app/content/Content';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {GetPrincipalByKeyRequest} from 'lib-contentstudio/app/resource/GetPrincipalByKeyRequest';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {Principal} from 'lib-admin-ui/security/Principal';
import {ArchiveTreeGridRefreshRequiredEvent} from './ArchiveTreeGridRefreshRequiredEvent';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';

export class ArchiveTreeGrid extends TreeGrid<ArchiveViewItem> {

    private readonly treeGridActions: ArchiveTreeGridActions;

    constructor() {
        super(ArchiveTreeGridHelper.createTreeGridBuilder());

        this.treeGridActions = new ArchiveTreeGridActions();
        this.setContextMenu(new TreeGridContextMenu(this.treeGridActions));

        ArchiveTreeGridRefreshRequiredEvent.on(() => {
            this.refresh();
        });

        ProjectContext.get().onProjectChanged(() => {
            this.refresh();
        });
    }

    refresh() {
        this.deselectAll();
        this.reload();
        this.treeGridActions.updateActionsEnabledState([]);
    }

    protected fetchRoot(): Q.Promise<ArchiveViewItem[]> {
        return new GetContentByPathRequest(ContentPath.fromString('/__archive__')).sendAndParse().then((content: Content) => {
            return new ListContentByIdRequest(content.getContentId()).sendAndParse().then((response: ContentResponse<ContentSummary>) => {
                return this.fetchPrincipals(response.getContents()).then((usersMap: Map<string, Principal>) => {
                    return response.getContents().map((archiveBundleContent: ContentSummary) => {
                        return new ArchiveBundleViewItemBuilder()
                            .setArchivedBy(usersMap.get(archiveBundleContent.getModifier()))
                            .setData(ContentSummaryAndCompareStatus.fromContentSummary(archiveBundleContent))
                            .build();
                    });
                });
            });
        });
    }

    private fetchPrincipals(bundles: ContentSummary[]): Q.Promise<Map<string, Principal>> {
        const usersMap: Map<string, Q.Promise<Principal>> = new Map();
        const promises: Q.Promise<Principal>[] = [];

        bundles.forEach((item: ContentSummary) => {
            const id: string = item.getModifier();

            if (!usersMap.has(id)) {
                const requestPromise: Q.Promise<Principal> = new GetPrincipalByKeyRequest(PrincipalKey.fromString(id)).sendAndParse();
                usersMap.set(id, requestPromise);
                promises.push(requestPromise);
            }
        });

        return Q.all(promises).then((principals: Principal[]) => {
            const resultsMap: Map<string, Principal> = new Map();

            principals.forEach((principal: Principal) => {
                resultsMap.set(principal.getKey().toString(), principal);
            });

            return resultsMap;
        });
    }

    protected fetchChildren(parentNode?: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        if (ObjectHelper.iFrameSafeInstanceOf(parentNode.getData(), ArchiveBundleViewItem)) {
            return this.fetchArchiveBundleChildren(<ArchiveBundleViewItem>parentNode.getData());
        }

        return this.fetchContentChildren(parentNode);
    }

    private fetchArchiveBundleChildren(archiveBundle: ArchiveBundleViewItem): Q.Promise<ArchiveViewItem[]> {
        return ContentSummaryAndCompareStatusFetcher.fetchChildren(new ContentId(archiveBundle.getId())).then(
            (response: ContentResponse<ContentSummaryAndCompareStatus> ) => {
                const items: ContentSummaryAndCompareStatus[] = response.getContents();

                return ContentSummaryAndCompareStatusFetcher.updateRenderableContents(items).then(() => {
                    return items.map((item: ContentSummaryAndCompareStatus) => {
                        return new ArchiveContentViewItemBuilder()
                            .setData(item)
                            .build();
                    });
                });
            });
    }

    private fetchContentChildren(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        if (parentNode.hasChildren() && this.isEmptyNode(parentNode.getChildren()[parentNode.getChildren().length - 1])) {
            parentNode.getChildren().pop();
        }

        const content: ContentSummaryAndCompareStatus = (<ArchiveContentViewItem>parentNode.getData()).getData();
        const from: number = parentNode.getChildren().length;

        return ContentSummaryAndCompareStatusFetcher.fetchChildren(content.getContentId(), from, 10).then(
            (response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                const total: number = response.getMetadata().getTotalHits();
                parentNode.setMaxChildren(total);

                const newItems: ArchiveViewItem[] = response.getContents().map((c: ContentSummaryAndCompareStatus) => {
                    return new ArchiveContentViewItemBuilder()
                        .setData(c)
                        .build();
                });

                if (parentNode.getChildren().length + newItems.length < total) {
                    newItems.push(new ArchiveContentViewItemBuilder()
                        .setData(new ContentSummaryAndCompareStatus())
                        .build());
                }

                return parentNode.getChildren().map((child: TreeNode<ArchiveViewItem>) => child.getData()).concat(newItems);
            });
    }

    protected isEmptyNode(node: TreeNode<ArchiveViewItem>): boolean {
        return !node.getData().getData().getContentSummary();
    }

    protected hasChildren(item: ArchiveViewItem): boolean {
       return item.hasChildren();
    }

    protected isToBeExpanded(node: TreeNode<ArchiveViewItem>): boolean {
        return super.isToBeExpanded(node) || ObjectHelper.iFrameSafeInstanceOf(node.getData(), ArchiveBundleViewItem);
    }

    protected isSelectableNode(node: TreeNode<ArchiveViewItem>): boolean {
        return ObjectHelper.iFrameSafeInstanceOf(node.getData(), ArchiveBundleViewItem);
    }

}
