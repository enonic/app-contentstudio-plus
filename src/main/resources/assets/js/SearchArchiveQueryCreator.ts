import {SearchContentQueryCreator} from 'lib-contentstudio/app/browse/filter/SearchContentQueryCreator';
import {ArchiveAggregation} from './ArchiveAggregation';

export class SearchArchiveQueryCreator
    extends SearchContentQueryCreator {

    protected appendAggregationsAndFilter(contentAggregations?: string[]): void {
        super.appendAggregationsAndFilter(contentAggregations);

        if (!contentAggregations || contentAggregations.some((a: string) => a === ArchiveAggregation.ARCHIVER)) {
            this.appendArchiverAggregationQuery();
            this.appendArchiverFilter();
        }
    }

    private appendArchiverAggregationQuery(): void {
        this.addTermsAggregation(ArchiveAggregation.ARCHIVER, 'archivedBy');
    }

    private appendArchiverFilter(): void {
        this.appendPropertyFilter(ArchiveAggregation.ARCHIVER, 'archivedBy');
    }
}