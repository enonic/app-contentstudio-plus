import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveContentViewer} from './ArchiveContentViewer';
import {ListBox} from 'lib-admin-ui/ui/selector/list/ListBox';


export class ArchiveDialogItemList
    extends ListBox<ContentSummaryAndCompareStatus> {

    constructor() {
        super('archive-dialog-item-list');
    }

    createItemView(item: ContentSummaryAndCompareStatus): ArchiveContentViewer {
        const viewer = new ArchiveContentViewer();
        viewer.setObject(item);

        return viewer;
    }

    getItemId(item: ContentSummaryAndCompareStatus): string {
        return item.getId();
    }
}
