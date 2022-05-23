import {SearchInputValues} from 'lib-admin-ui/query/SearchInputValues';
import {ContentAggregationsFetcher} from 'lib-contentstudio/app/browse/filter/ContentAggregationsFetcher';
import {ArchiveSearchContentQueryCreator} from './ArchiveSearchContentQueryCreator';

export class ArchiveAggregationsFetcher
    extends ContentAggregationsFetcher {

    protected getContentQueryCreator(searchInputValues: SearchInputValues): ArchiveSearchContentQueryCreator {
        return new ArchiveSearchContentQueryCreator(searchInputValues);
    }
}