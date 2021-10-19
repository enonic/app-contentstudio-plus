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
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveServerEvent} from 'lib-contentstudio/app/event/ArchiveServerEvent';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';

export class ArchiveTreeGrid
    extends TreeGrid<ArchiveViewItem> {

    private readonly treeGridActions: ArchiveTreeGridActions;

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

    protected fetchChildren(parentNode?: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        return this.fetchContentChildren(parentNode || this.getRoot().getCurrentRoot());
    }

    private fetchContentChildren(parentNode: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        this.removeEmptyNode(parentNode);
        const parentContentId: ContentId =
            parentNode.hasParent() ? (<ArchiveContentViewItem>parentNode.getData()).getData().getContentId() : null;
        const from: number = parentNode.getChildren().length;

        return this.archiveContentFetcher.fetchChildren(parentContentId, from, 10)
            .then((response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                const total: number = response.getMetadata().getTotalHits();
                const contents: ContentSummaryAndCompareStatus[] = response.getContents();
                parentNode.setMaxChildren(total);

                const newArchiveViewItems: ArchiveContentViewItem[] = contents.map((c: ContentSummaryAndCompareStatus) => {
                    return new ArchiveContentViewItemBuilder()
                        .setOriginalParentPath(this.getParentPath(parentNode, c))
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
            item.getPath().toString();
        }

        const separator: string = originalParentPath.endsWith(ContentPath.NODE_PATH_DIVIDER) ? '' : ContentPath.NODE_PATH_DIVIDER;

        return `${originalParentPath}${separator}${originalName}`;
    }

    protected isEmptyNode(node: TreeNode<ArchiveViewItem>): boolean {
        return !node.getData().getData().getContentSummary();
    }

    protected hasChildren(item: ArchiveViewItem): boolean {
        return item.hasChildren();
    }
}
