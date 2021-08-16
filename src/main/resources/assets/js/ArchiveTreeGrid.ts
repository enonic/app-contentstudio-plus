import * as Q from 'q';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ArchiveTreeGridHelper} from './ArchiveTreeGridHelper';
import {ListArchivedItemsRequest} from './resource/ListArchivedItemsRequest';
import {ListArchivedItemsResult} from './ListArchivedItemsResult';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {CompareStatus} from 'lib-contentstudio/app/content/CompareStatus';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {ArchiveTreeGridActions} from './ArchiveTreeGridActions';
import {ArchiveViewItem} from './ArchiveViewItem';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveBundleViewItem, ArchiveBundleViewItemBuilder} from './ArchiveBundleViewItem';
import {ArchiveContentViewItem, ArchiveContentViewItemBuilder} from './ArchiveContentViewItem';
import {ContentResponse} from 'lib-contentstudio/app/resource/ContentResponse';

export class ArchiveTreeGrid extends TreeGrid<ArchiveViewItem> {

    constructor() {
        super(ArchiveTreeGridHelper.createTreeGridBuilder());

        this.setContextMenu(new TreeGridContextMenu(new ArchiveTreeGridActions()));
    }

    protected fetchRoot(): Q.Promise<ArchiveViewItem[]> {
        return new ListArchivedItemsRequest().sendAndParse().then((result: ListArchivedItemsResult[]) => {
            return result.map((archiveBundle: ListArchivedItemsResult) => {
                return new ArchiveBundleViewItemBuilder()
                    .setBundleId(archiveBundle.id)
                    .setArchiveTimeAsString(archiveBundle.archiveTime)
                    .setContentIdsAsStrings(archiveBundle.contentIds)
                    .build();
            });
        });
    }

    protected fetchChildren(parentNode?: TreeNode<ArchiveViewItem>): Q.Promise<ArchiveViewItem[]> {
        if (ObjectHelper.iFrameSafeInstanceOf(parentNode.getData(), ArchiveBundleViewItem)) {
            return this.fetchArchiveBundleChildren(<ArchiveBundleViewItem>parentNode.getData());
        }

        return this.fetchContentChildren((<ArchiveContentViewItem>parentNode.getData()).getData());
    }

    private fetchArchiveBundleChildren(archiveBundle: ArchiveBundleViewItem): Q.Promise<ArchiveViewItem[]> {
        return ContentSummaryAndCompareStatusFetcher.fetchByIds(archiveBundle.getContentIds()).then(
            (items: ContentSummaryAndCompareStatus[]) => {
                return ContentSummaryAndCompareStatusFetcher.updateRenderableContents(items).then(() => {
                    return items.map((item: ContentSummaryAndCompareStatus) => {
                        return new ArchiveContentViewItemBuilder()
                            .setData(item)
                            .build();
                    });
                });
            });
    }

    private fetchContentChildren(content: ContentSummaryAndCompareStatus): Q.Promise<ArchiveViewItem[]> {
        return ContentSummaryAndCompareStatusFetcher.fetchChildren(content.getContentId()).then(
            (response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                return response.getContents().map((c: ContentSummaryAndCompareStatus) => {
                    return new ArchiveContentViewItemBuilder()
                        .setData(c)
                        .build();
                });
            });
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
