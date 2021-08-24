import {ArchiveContentDialogViewer} from './ArchiveContentDialogViewer';
import {ListBox} from 'lib-admin-ui/ui/selector/list/ListBox';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';

export class ArchiveItemsList extends ListBox<ContentSummaryAndCompareStatus> {

    private static LOADING_CLASS: string = 'loading';

    private ids: ContentId[];

    private loading: boolean;

    constructor() {
        super('archive-items-list icon-spinner');
    }

    setItemsIds(ids: ContentId[]) {
        this.ids = ids;
        this.load();
    }

    load() {
        const totalLoaded: number = this.getItemCount();

        if (this.loading || totalLoaded >= this.ids.length) {
            return;
        }

        this.loading = true;
        this.addClass(ArchiveItemsList.LOADING_CLASS);

        const idsToLoad: ContentId[] = this.ids.slice(totalLoaded, totalLoaded + 10);

        ContentSummaryAndCompareStatusFetcher.fetchByIds(idsToLoad)
            .then((items: ContentSummaryAndCompareStatus[]) => {
                this.loading = false;
                this.addItems(items);
                this.removeClass(ArchiveItemsList.LOADING_CLASS);
            })
            .catch((error: any) => {
                DefaultErrorHandler.handle(error);
                this.loading = false; // not using finally because need to set loading to false before setting items
                this.removeClass(ArchiveItemsList.LOADING_CLASS);
            });
    }

    protected createItemView(item: ContentSummaryAndCompareStatus, readOnly: boolean): ArchiveContentDialogViewer {
        const viewer: ArchiveContentDialogViewer = new ArchiveContentDialogViewer();

        viewer.setObject(item);

        return viewer;
    }

    protected getItemId(item: ContentSummaryAndCompareStatus): string {
        return item.getId();
    }
}
