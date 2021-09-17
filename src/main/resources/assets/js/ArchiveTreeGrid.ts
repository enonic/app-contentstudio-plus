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
import {ListArchivedRequest} from './resource/ListArchivedRequest';
import {ArchivedContainer} from './ArchivedContainer';

export class ArchiveTreeGrid
    extends TreeGrid<ArchiveViewItem> {

    private readonly treeGridActions: ArchiveTreeGridActions;

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

    fetchRoot(): Q.Promise<ArchiveViewItem[]> {
        const root: TreeNode<ArchiveViewItem> = this.getRoot().getCurrentRoot();

        this.removeEmptyNode(root);

        const from: number = root.getChildren().length;

        return ContentSummaryAndCompareStatusFetcher.fetchRoot(from, 10, 'archive').then(
            (data: ContentResponse<ContentSummaryAndCompareStatus>) => {
                return data.getContents().map(d =>  new ArchiveContentViewItemBuilder()
                    .setData(d)
                    .build());
            });
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
}
