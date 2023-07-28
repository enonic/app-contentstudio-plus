import {SearchContentQueryCreator} from 'lib-contentstudio/app/browse/filter/SearchContentQueryCreator';
import {ArchiveAggregation} from './ArchiveAggregation';

export class ArchiveSearchContentQueryCreator
    extends SearchContentQueryCreator {

    protected appendAggregationsAndFilter(contentAggregations?: string[]): void {
        super.appendAggregationsAndFilter(contentAggregations);

        if (!contentAggregations || contentAggregations.some((a: string) => a === ArchiveAggregation.ARCHIVED_BY.toString())) {
            this.appendArchiverAggregationQuery();
            this.appendArchiverFilter();
        }

        if (!contentAggregations || contentAggregations.some((a: string) => a === ArchiveAggregation.ARCHIVED.toString())) {
            this.appendArchivedAggregationQuery();
            this.appArchivedFilter();
        }
    }

    private appendArchiverAggregationQuery(): void {
        this.addTermsAggregation(ArchiveAggregation.ARCHIVED_BY, 'archivedBy');
    }

    private appendArchiverFilter(): void {
        this.appendPropertyFilter(ArchiveAggregation.ARCHIVED_BY, 'archivedBy');
    }

    private appendArchivedAggregationQuery(): void {
        this.appendDateAggregationQuery(ArchiveAggregation.ARCHIVED, 'archivedTime');
    }

    private appArchivedFilter(): void {
        this.appendDateFilter(ArchiveAggregation.ARCHIVED, 'archivedTime');
    }
}
