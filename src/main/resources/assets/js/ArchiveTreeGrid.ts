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

export class ArchiveTreeGrid
    extends TreeGrid<ArchiveViewItem> {

    private readonly treeGridActions: ArchiveTreeGridActions;

    private rootArchiveContentId: ContentId;

    private usersMap: Map<string, Principal> = new Map<string, Principal>();

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
        return this.getRootArchiveContentId().then((rootId: ContentId) => {
            const parentNode: TreeNode<ArchiveViewItem> = this.getRoot().getDefaultRoot();
            this.removeEmptyNode(parentNode);
            const from: number = parentNode.getChildren().length;

            return ContentSummaryAndCompareStatusFetcher.fetchChildren(rootId, from, 10)
                .then((response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                    const total: number = response.getMetadata().getTotalHits();
                    parentNode.setMaxChildren(total);

                    return this.fetchPrincipals(response.getContents()).then(() => {
                        const newItems: ArchiveViewItem[] = response.getContents().map(
                            (archiveBundleContent: ContentSummaryAndCompareStatus) => {
                                return new ArchiveBundleViewItemBuilder()
                                    .setArchivedBy(this.usersMap.get(archiveBundleContent.getContentSummary().getModifier()))
                                    .setData(archiveBundleContent)
                                    .build();
                            });

                        if (parentNode.getChildren().length + newItems.length < total) {
                            newItems.push(new ArchiveBundleViewItemBuilder()
                                .setData(new ContentSummaryAndCompareStatus())
                                .build());
                        }

                        return parentNode.getChildren().map((child: TreeNode<ArchiveViewItem>) => child.getData()).concat(newItems);
                    });
                });
        });
    }

    private getRootArchiveContentId(): Q.Promise<ContentId> {
        if (this.rootArchiveContentId) {
            return Q(this.rootArchiveContentId);
        }

        return new GetContentByPathRequest(ContentPath.fromString('/__archive__'))
            .sendAndParse()
            .then((content: Content) => content.getContentId());
    }


    private fetchPrincipals(bundles: ContentSummaryAndCompareStatus[]): Q.Promise<void> {
        const usersToLoadMap: Map<string, Q.Promise<Principal>> = new Map();
        const promises: Q.Promise<Principal>[] = [];

        bundles.forEach((item: ContentSummaryAndCompareStatus) => {
            const id: string = item.getContentSummary().getModifier();

            if (!this.usersMap.has(id) && !usersToLoadMap.has(id)) {
                const requestPromise: Q.Promise<Principal> = new GetPrincipalByKeyRequest(PrincipalKey.fromString(id)).sendAndParse();
                usersToLoadMap.set(id, requestPromise);
                promises.push(requestPromise);
            }
        });

        return Q.all(promises).then((principals: Principal[]) => {
            principals.forEach((principal: Principal) => {
                this.usersMap.set(principal.getKey().toString(), principal);
            });

            return Q(null);
        });
    }

    protected fetchChildren(parentNode?: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        return parentNode.hasParent() ? this.fetchContentChildren(parentNode) : this.fetchRoot();
    }

    private fetchContentChildren(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        this.removeEmptyNode(parentNode);
        const content: ContentSummaryAndCompareStatus = (<ArchiveContentViewItem>parentNode.getData()).getData();
        const from: number = parentNode.getChildren().length;

        return ContentSummaryAndCompareStatusFetcher.fetchChildren(content.getContentId(), from, 10).then(
            (response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                const total: number = response.getMetadata().getTotalHits();
                const contents: ContentSummaryAndCompareStatus[] = response.getContents();
                parentNode.setMaxChildren(total);

                ContentSummaryAndCompareStatusFetcher.updateRenderableContents(contents);

                const newArchiveViewItems: ArchiveViewItem[] = contents.map((c: ContentSummaryAndCompareStatus) => {
                    return new ArchiveContentViewItemBuilder()
                        .setData(c)
                        .build();
                });

                if (parentNode.getChildren().length + newArchiveViewItems.length < total) {
                    newArchiveViewItems.push(new ArchiveContentViewItemBuilder()
                        .setData(new ContentSummaryAndCompareStatus())
                        .build());
                }

                return parentNode.getChildren().map((child: TreeNode<ArchiveViewItem>) => child.getData()).concat(newArchiveViewItems);
            });
    }

    private removeEmptyNode(parentNode: TreeNode<ArchiveViewItem>) {
        if (parentNode.hasChildren() && this.isEmptyNode(parentNode.getChildren()[parentNode.getChildren().length - 1])) {
            parentNode.getChildren().pop();
        }
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
