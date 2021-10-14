import * as Q from 'q';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ArchiveTreeGridHelper} from './ArchiveTreeGridHelper';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {ArchiveTreeGridActions} from './ArchiveTreeGridActions';
import {ArchiveViewItem} from './ArchiveViewItem';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {ArchiveContentViewItem, ArchiveContentViewItemBuilder} from './ArchiveContentViewItem';
import {ContentResponse} from 'lib-contentstudio/app/resource/ContentResponse';
import {GetPrincipalByKeyRequest} from 'lib-contentstudio/app/resource/GetPrincipalByKeyRequest';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {Principal} from 'lib-admin-ui/security/Principal';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveServerEvent} from 'lib-contentstudio/app/event/ArchiveServerEvent';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import { ContentPath } from 'lib-contentstudio/app/content/ContentPath';

export class ArchiveTreeGrid
    extends TreeGrid<ArchiveViewItem> {

    private readonly treeGridActions: ArchiveTreeGridActions;

    private usersMap: Map<string, Principal> = new Map<string, Principal>();

    private archiveContentFetcher: ContentSummaryAndCompareStatusFetcher;

    constructor() {
        super(ArchiveTreeGridHelper.createTreeGridBuilder());

        this.treeGridActions = new ArchiveTreeGridActions();
        this.archiveContentFetcher = new ContentSummaryAndCompareStatusFetcher(ArchiveResourceRequest.ARCHIVE_PATH);
        this.setContextMenu(new TreeGridContextMenu(this.treeGridActions));

        this.initListeners();
    }

    protected initListeners() {
        ArchiveServerEvent.on(() => {
            this.refresh();
        });

        let isRefreshTriggered: boolean = false;

        ContentServerEventsHandler.getInstance().onContentArchived(() => {
            if (!isRefreshTriggered) {
                isRefreshTriggered = true;

                this.whenShown(() => {
                    this.refresh();
                    isRefreshTriggered = false;
                });
            }
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

        return this.archiveContentFetcher.fetchRoot(from, 10).then(
            (data: ContentResponse<ContentSummaryAndCompareStatus>) => {
                return data.getContents().map((d: ContentSummaryAndCompareStatus) => new ArchiveContentViewItemBuilder()
                    .setOriginalParentPath(this.getOriginalParentPathForRootItem(d))
                    .setData(d)
                    .build());
            });
    }

    private getOriginalParentPathForRootItem(item: ContentSummaryAndCompareStatus): string {
        const originalParentPath: string = item.getContentSummary().getOriginalParentPath();
        const originalName: string = item.getContentSummary().getOriginalName();

        if (!originalParentPath || !originalName) {
            item.getPath().toString();
        }

        const separator: string = originalParentPath.endsWith(ContentPath.NODE_PATH_DIVIDER) ? '' : ContentPath.NODE_PATH_DIVIDER;

        return `${originalParentPath}${separator}${originalName}`;
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

        return this.archiveContentFetcher.fetchChildren(content.getContentId(), from, 10)
            .then((response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                const total: number = response.getMetadata().getTotalHits();
                const contents: ContentSummaryAndCompareStatus[] = response.getContents();
                parentNode.setMaxChildren(total);

                const newArchiveViewItems: ArchiveContentViewItem[] = contents.map((c: ContentSummaryAndCompareStatus) => {
                    return new ArchiveContentViewItemBuilder()
                        .setOriginalParentPath((<ArchiveContentViewItem>parentNode.getData()).getOriginalParentPath())
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
