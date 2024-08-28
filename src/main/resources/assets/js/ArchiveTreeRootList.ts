import {ArchiveTreeList} from './ArchiveTreeList';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {ArchiveContentFetcher} from './ArchiveContentFetcher';
import * as Q from 'q';
import {FetchResponse} from './FetchResponse';

export class ArchiveTreeRootList extends ArchiveTreeList {

    private filterQuery: ContentQuery;

    setFilterQuery(query: ContentQuery): void {
        this.filterQuery = query ? new ContentQuery() : null;

        if (query) {
            this.filterQuery
                .setSize(ArchiveContentFetcher.FETCH_SIZE)
                .setQueryFilters(query.getQueryFilters())
                .setQuery(query.getQuery())
                .setContentTypeNames(query.getContentTypes())
                .setMustBeReferencedById(query.getMustBeReferencedById());
        }

        this.load();
    }

    protected fetchRootItems(): Q.Promise<FetchResponse> {
        if (!this.filterQuery) {
            return super.fetchRootItems();
        }

        this.filterQuery.setFrom(this.getItemCount());

        return this.fetcher.fetchByQuery(this.filterQuery);
    }

}