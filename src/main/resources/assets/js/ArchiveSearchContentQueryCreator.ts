import {SearchContentQueryCreator} from 'lib-contentstudio/app/browse/filter/SearchContentQueryCreator';
import {ArchiveAggregation} from './ArchiveAggregation';

export class ArchiveSearchContentQueryCreator
    extends SearchContentQueryCreator {

    protected appendAggregationsAndFilter(contentAggregations?: string[]): void {
        super.appendAggregationsAndFilter(contentAggregations);

        if (!contentAggregations || contentAggregations.some((a: string) => a === ArchiveAggregation.ARCHIVER)) {
            this.appendArchiverAggregationQuery();
            this.appendArchiverFilter();
        }

        if (!contentAggregations || contentAggregations.some((a: string) => a === ArchiveAggregation.ARCHIVED)) {
            this.appendArchivedAggregationQuery();
            this.appArchivedFilter();
        }
    }

    private appendArchiverAggregationQuery(): void {
        this.addTermsAggregation(ArchiveAggregation.ARCHIVER, 'archivedBy');
    }

    private appendArchiverFilter(): void {
        this.appendPropertyFilter(ArchiveAggregation.ARCHIVER, 'archivedBy');
    }

    private appendArchivedAggregationQuery(): void {
        this.appendDateAggregationQuery(ArchiveAggregation.ARCHIVED, 'archivedTime');
    }

    private appArchivedFilter(): void {
        this.appendDateFilter(ArchiveAggregation.ARCHIVED, 'archivedTime');
    }
}