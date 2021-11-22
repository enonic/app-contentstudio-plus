import {ArchiveContentDialogViewer} from './ArchiveContentDialogViewer';
import {ListBox} from 'lib-admin-ui/ui/selector/list/ListBox';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {Element} from 'lib-admin-ui/dom/Element';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';

export class ArchiveItemsList extends ListBox<ContentSummaryAndCompareStatus> {

    private static LOADING_CLASS: string = 'loading';

    private idsToLoad: ContentId[];

    private loading: boolean;

    private archiveContentFetcher: ContentSummaryAndCompareStatusFetcher;

    constructor() {
        super('archive-items-list icon-spinner');

        this.archiveContentFetcher = new ContentSummaryAndCompareStatusFetcher(ArchiveResourceRequest.ARCHIVE_PATH);

        this.initListeners();
    }

    private initListeners() {
        this.whenRendered(() => {
            const scrollableParent: Element = this.getParentElement().getParentElement();

            const scrollHandler = AppHelper.debounce(() => {
                if (this.isScrolledToTheBottom(scrollableParent)) {
                    this.load();
                }
            }, 300);

            scrollableParent.onScroll(() => {
                scrollHandler();
            });

            this.onItemsAdded(() => {
                if (this.isScrolledToTheBottom(scrollableParent)) {
                    this.load();
                }
            });
        });

    }

    private isScrolledToTheBottom(scrollableParent: Element) {
        const scrollableContainerHTML: HTMLElement = scrollableParent.getHTMLElement();

        return scrollableContainerHTML.scrollHeight - scrollableContainerHTML.scrollTop - scrollableContainerHTML.clientHeight < 200;
    }

    setItemsIds(ids: ContentId[]) {
        this.idsToLoad = ids;
        this.load();
    }

    private load() {
        const totalLoaded: number = this.getItemCount();

        if (this.loading || totalLoaded >= this.idsToLoad.length) {
            return;
        }

        this.loading = true;
        this.addClass(ArchiveItemsList.LOADING_CLASS);

        const idsToLoad: ContentId[] = this.idsToLoad.slice(totalLoaded, totalLoaded + 10);

        this.archiveContentFetcher.fetchByIds(idsToLoad)
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
