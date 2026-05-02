import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Aggregation} from '@enonic/lib-admin-ui/aggregation/Aggregation';
import {ContentAggregation} from '@enonic/lib-contentstudio/app/browse/filter/ContentAggregation';
import {ArchiveServerEvent} from '@enonic/lib-contentstudio/app/event/ArchiveServerEvent';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveAggregation} from './ArchiveAggregation';
import {ContentBrowseFilterPanel} from '@enonic/lib-contentstudio/app/browse/filter/ContentBrowseFilterPanel';
import {ArchiveAggregationsFetcher} from './ArchiveAggregationsFetcher';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';

export class ArchiveFilterPanel
    extends ContentBrowseFilterPanel<ArchiveContentViewItem> {

    protected aggregationsFetcher: ArchiveAggregationsFetcher;

    protected createAggregationFetcher(): ArchiveAggregationsFetcher {
        const aggregationsFetcher = new ArchiveAggregationsFetcher([
            ContentAggregation.CONTENT_TYPE.toString(),
            ContentAggregation.OWNER.toString(),
            ContentAggregation.LANGUAGE.toString(),
            ArchiveAggregation.ARCHIVED_BY.toString(),
        ]);
        aggregationsFetcher.setRootPath(ArchiveResourceRequest.ARCHIVE_PATH);

        return aggregationsFetcher;
    }

    getExportOptions(): undefined {
        return undefined;
    }

    protected sortAggregations(aggregations: Aggregation[]): void {
        const order = [
            ContentAggregation.CONTENT_TYPE.toString(),
            ArchiveAggregation.ARCHIVED_BY.toString(),
            ContentAggregation.OWNER.toString(),
            ContentAggregation.LANGUAGE.toString(),
        ];
        aggregations.sort((a, b) => order.indexOf(a.getName()) - order.indexOf(b.getName()));
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
}
