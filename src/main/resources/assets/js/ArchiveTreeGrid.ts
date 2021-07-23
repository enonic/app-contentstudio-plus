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

export class ArchiveTreeGrid extends TreeGrid<ContentSummaryAndCompareStatus> {

    constructor() {
        super(ArchiveTreeGridHelper.createTreeGridBuilder());

        this.setContextMenu(new TreeGridContextMenu(new ArchiveTreeGridActions()));
    }

    protected fetchRoot(): Q.Promise<ContentSummaryAndCompareStatus[]> {
        return new ListArchivedItemsRequest().sendAndParse().then((result: ListArchivedItemsResult[]) => {
            const ids: string[] = [];

            result.forEach((listArchivedItemsResult: ListArchivedItemsResult) => {
                ids.push(...listArchivedItemsResult.contentIds);
            });

            const contentIds: ContentId[] = ids.map((id: string) => new ContentId(id));

            return ContentSummaryAndCompareStatusFetcher.fetchByIds(contentIds).then((items: ContentSummaryAndCompareStatus[]) => {
                return ContentSummaryAndCompareStatusFetcher.updateRenderableContents(items).then(() => {
                    return items.map((item: ContentSummaryAndCompareStatus) => item.setCompareStatus(CompareStatus.ARCHIVED));

                    // return items.map((item: ContentSummaryAndCompareStatus) => {
                    //     return new ArchivedItem()
                    //         .setContentSummary(item.getContentSummary())
                    //         .setRenderable(item.isRenderable())
                    //         .setCompareStatus(CompareStatus.ARCHIVED);
                    // })
                });
            });
        });
    }

    protected hasChildren(data: ContentSummaryAndCompareStatus): boolean {
        return data.hasChildren();
    }

}
