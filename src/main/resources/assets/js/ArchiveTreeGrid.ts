import * as Q from 'q';
import {TreeGrid} from '@enonic/lib-admin-ui/ui/treegrid/TreeGrid';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveTreeGridHelper} from './ArchiveTreeGridHelper';
import {TreeGridContextMenu} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {ArchiveTreeGridActions} from './ArchiveTreeGridActions';
import {ArchiveViewItem} from './ArchiveViewItem';
import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {ArchiveContentViewItem, ArchiveContentViewItemBuilder} from './ArchiveContentViewItem';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveServerEvent} from 'lib-contentstudio/app/event/ArchiveServerEvent';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {ContentServerChangeItem} from 'lib-contentstudio/app/event/ContentServerChangeItem';
import {ArchiveHelper} from './ArchiveHelper';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ArchiveContentFetcher} from './ArchiveContentFetcher';
import {FetchResponse} from './FetchResponse';

export class ArchiveTreeGrid
    extends TreeGrid<ArchiveViewItem> {

    private readonly treeGridActions: ArchiveTreeGridActions;

    private archiveContentFetcher: ArchiveContentFetcher;

    private filterQuery?: ContentQuery;

    constructor() {
        super(ArchiveTreeGridHelper.createTreeGridBuilder());

        this.treeGridActions = new ArchiveTreeGridActions();
        this.archiveContentFetcher = new ArchiveContentFetcher();
        this.setContextMenu(new TreeGridContextMenu(this.treeGridActions));

        this.initListeners();
    }

    setFilterQuery(query: ContentQuery): void {
        this.filterQuery = query ? new ContentQuery() : null;

        if (query) {
            this.filterQuery
                .setSize(ArchiveContentFetcher.FETCH_SIZE)
                .setQueryFilters(query.getQueryFilters())
                .setQueryExpr(query.getQueryExpr())
                .setContentTypeNames(query.getContentTypes())
                .setMustBeReferencedById(query.getMustBeReferencedById());

            this.getRoot().setFiltered(true);
            this.reload().catch(DefaultErrorHandler.handle);
        } else {
            this.resetFilter();
        }
    }

    refresh(): void {
        this.deselectAll();
        void this.reload();
        void this.treeGridActions.updateActionsEnabledState([]);
    }

    protected initListeners(): void {
        ArchiveServerEvent.on((event: ArchiveServerEvent) => {
            const type: NodeServerChangeType = event.getNodeChange().getChangeType();

            if (type === NodeServerChangeType.MOVE || type === NodeServerChangeType.DELETE) {
                const itemsToRemove: ContentServerChangeItem[] = this.extractTopMostContentItems(event);
                const allEventItemsIds: string[] =
                    event.getNodeChange().getChangeItems().map((item: ContentServerChangeItem) => item.getContentId().toString());

                this.deselectNodes(allEventItemsIds); // required because treegrid lacks delete for multiple ids

                itemsToRemove.forEach((item: ContentServerChangeItem) => {
                    const id: string = item.getContentId().toString();
                    this.collapseNodeByDataId(id); // required because treegrid lacks delete for multiple ids
                    this.deleteNodeByDataId(id);
                });
            }
        });

        let isRefreshTriggered = false;

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

    protected fetchChildren(parentNode?: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        return this.fetchContentChildren(parentNode || this.getRoot().getCurrentRoot());
    }

    protected isEmptyNode(node: TreeNode<ArchiveViewItem>): boolean {
        return !node.getData().getData().getContentSummary();
    }

    protected hasChildren(item: ArchiveViewItem): boolean {
        return item.hasChildren();
    }

    private fetchContentChildren(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        this.removeEmptyNode(parentNode);

        return this.fetchItems(parentNode).then((fetchResponse: FetchResponse) => {
            parentNode.setMaxChildren(fetchResponse.total);
            return this.getParentNodeChildrenItems(parentNode).concat(this.createNewArchiveItems(parentNode, fetchResponse));
        });
    }

    private removeEmptyNode(parentNode: TreeNode<ArchiveViewItem>): void {
        if (parentNode.hasChildren() && this.isEmptyNode(parentNode.getChildren()[parentNode.getChildren().length - 1])) {
            parentNode.getChildren().pop();
        }
    }

    private getParentNodeChildrenItems(parentNode: TreeNode<ArchiveViewItem>): ArchiveViewItem[] {
        return parentNode.getChildren().map((child: TreeNode<ArchiveViewItem>) => child.getData());
    }

    private createNewArchiveItems(parentNode: TreeNode<ArchiveViewItem>, fetchResponse: FetchResponse): ArchiveContentViewItem[] {
        const newArchiveViewItems: ArchiveContentViewItem[] = fetchResponse.items.map((c: ContentSummaryAndCompareStatus) => {
            return new ArchiveContentViewItemBuilder()
                .setOriginalParentPath(this.getParentPath(parentNode, c))
                .setData(c)
                .build();
        });

        if (parentNode.getChildren().length + newArchiveViewItems.length < fetchResponse.total) {
            newArchiveViewItems.push(new ArchiveContentViewItemBuilder()
                .setData(new ContentSummaryAndCompareStatus())
                .build());
        }

        return newArchiveViewItems;
    }

    private getParentPath(parentNode: TreeNode<ArchiveViewItem>, content: ContentSummaryAndCompareStatus): string {
        if (parentNode.hasParent()) {
            return (<ArchiveContentViewItem>parentNode.getData()).getOriginalParentPath();
        }

        return this.getOriginalParentPathForRootItem(content);
    }

    private getOriginalParentPathForRootItem(item: ContentSummaryAndCompareStatus): string {
        const originalParentPath: string = item.getContentSummary().getOriginalParentPath();
        const originalName: string = item.getContentSummary().getOriginalName();

        if (!originalParentPath || !originalName) {
            return item.getPath().toString();
        }

        const separator: string = originalParentPath.endsWith(ContentPath.NODE_PATH_DIVIDER) ? '' : ContentPath.NODE_PATH_DIVIDER;

        return `${originalParentPath}${separator}${originalName}`;
    }

    private extractTopMostContentItems(event: ArchiveServerEvent): ContentServerChangeItem[] {
        return <ContentServerChangeItem[]>ArchiveHelper.filterTopMostItems(event.getNodeChange().getChangeItems());
    }

    private fetchItems(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<FetchResponse> {
        if (this.filterQuery && !parentNode.hasParent()) {
            return this.fetchByQuery(parentNode);
        }

        return this.fetchContents(parentNode);
    }

    private fetchByQuery(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<FetchResponse> {
        this.filterQuery.setFrom(parentNode.getChildren().length);

        return this.archiveContentFetcher.fetchByQuery(this.filterQuery);
    }

    private fetchContents(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<FetchResponse> {
        const from: number = parentNode.getChildren().length;
        const parentContentId: ContentId = parentNode.hasParent() ? parentNode.getData().getData().getContentId() : null;

        return this.archiveContentFetcher.fetchContents(parentContentId, from);
    }
}
