import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveItemViewer} from './ArchiveItemViewer';
import {ListBox} from 'lib-admin-ui/ui/selector/list/ListBox';


export class ArchiveDialogItemList
    extends ListBox<ContentSummaryAndCompareStatus> {

    constructor() {
        super('archive-dialog-item-list');
    }
    createItemView(item: ContentSummaryAndCompareStatus): ArchiveItemViewer {
        const viewer = new ArchiveItemViewer();
        viewer.setObject(item);

        return viewer;
    }

    getItemId(item: ContentSummaryAndCompareStatus): string {
        return item.getId();
    }
}
