import {ArchiveContentDialogViewer} from './ArchiveContentDialogViewer';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';

export class ArchiveItemsList extends ListBox<ContentSummaryAndCompareStatus> {

    private static LOADING_CLASS = 'loading';

    private idsToLoad: ContentId[];

    private loading: boolean;

    private archiveContentFetcher: ContentSummaryAndCompareStatusFetcher;

    constructor() {
        super('archive-items-list icon-spinner');

        this.archiveContentFetcher = new ContentSummaryAndCompareStatusFetcher(ArchiveResourceRequest.ARCHIVE_PATH);

        this.initListeners();
    }

    setItemsIds(ids: ContentId[]): void {
        this.idsToLoad = ids;
        this.load();
    }

    protected createItemView(item: ContentSummaryAndCompareStatus, readOnly: boolean): ArchiveContentDialogViewer {
        const viewer: ArchiveContentDialogViewer = new ArchiveContentDialogViewer();

        viewer.setObject(item);

        return viewer;
    }

    protected getItemId(item: ContentSummaryAndCompareStatus): string {
        return item.getId();
    }

    private initListeners(): void {
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

    private isScrolledToTheBottom(scrollableParent: Element): boolean {
        const scrollableContainerHTML: HTMLElement = scrollableParent.getHTMLElement();

        return scrollableContainerHTML.scrollHeight - scrollableContainerHTML.scrollTop - scrollableContainerHTML.clientHeight < 200;
    }

    private load(): void {
        const totalLoaded: number = this.getItemCount();

        if (this.loading || totalLoaded >= this.idsToLoad.length) {
            return;
        }

        this.loading = true;
        this.addClass(ArchiveItemsList.LOADING_CLASS);

        const idsToLoad: ContentId[] = this.idsToLoad.slice(totalLoaded, totalLoaded + 10);

        this.archiveContentFetcher.fetchByIds(idsToLoad)
            .then((items: ContentSummary[]) => {
                this.loading = false;
                const contentSummaries: ContentSummaryAndCompareStatus[] =
                    items.map((contentSummary: ContentSummary) => ContentSummaryAndCompareStatus.fromContentSummary(contentSummary));
                this.addItems(contentSummaries);
                this.removeClass(ArchiveItemsList.LOADING_CLASS);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
                DefaultErrorHandler.handle(error);
                this.loading = false; // not using finally because need to set loading to false before setting items
                this.removeClass(ArchiveItemsList.LOADING_CLASS);
            });
    }
}
