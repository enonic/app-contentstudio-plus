import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentAggregation} from 'lib-contentstudio/app/browse/filter/ContentAggregation';
import {ArchiveServerEvent} from 'lib-contentstudio/app/event/ArchiveServerEvent';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveAggregation} from './ArchiveAggregation';
import {ContentBrowseFilterPanel} from 'lib-contentstudio/app/browse/filter/ContentBrowseFilterPanel';
import {ArchiveAggregationsFetcher} from './ArchiveAggregationsFetcher';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';

export class ArchiveFilterPanel
    extends ContentBrowseFilterPanel<ArchiveContentViewItem> {

    protected aggregationsFetcher: ArchiveAggregationsFetcher;

    protected createAggregationFetcher(): ArchiveAggregationsFetcher {
        const aggregationsFetcher = new ArchiveAggregationsFetcher(this.getAggregationsList());
        aggregationsFetcher.setRootPath(ArchiveResourceRequest.ARCHIVE_PATH);

        return aggregationsFetcher;
    }

    protected isPrincipalAggregation(name: string): boolean {
        return name === ContentAggregation.OWNER.toString() || name === ArchiveAggregation.ARCHIVED_BY.toString();
    }

    protected getAggregationEnum(): Record<string, string> {
        return {
            CONTENT_TYPE: ContentAggregation.CONTENT_TYPE,
            ARCHIVED: ArchiveAggregation.ARCHIVED,
            ARCHIVED_BY: ArchiveAggregation.ARCHIVED_BY,
            OWNER: ContentAggregation.OWNER,
            LANGUAGE: ContentAggregation.LANGUAGE
        };
    }

    protected isExportAllowed(): boolean {
        return false;
    }

    protected handleEvents(): void {
        super.handleEvents();

        let isRefreshTriggered = false;

        const debouncedReset = AppHelper.debounce(() => {
            isRefreshTriggered = false;

            this.resetFacets().catch(DefaultErrorHandler.handle);
        }, 500);

        const refreshRequiredHandler = (): void => {
            if (!isRefreshTriggered) {
                isRefreshTriggered = true;

                this.whenShown(() => {
                    debouncedReset();
                });
            }
        };

        ArchiveServerEvent.on(() => refreshRequiredHandler());
    }

    private getAggregationsList(): string[] {
        return Array.from(this.aggregations.keys());
    }
}
