import {ArchiveTreeList} from './ArchiveTreeList';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {ArchiveContentFetcher} from './ArchiveContentFetcher';
import Q from 'q';
import {FetchResponse} from './FetchResponse';

export class ArchiveTreeRootList extends ArchiveTreeList {

    private filterQuery: ContentQuery;

    private selectionMode: boolean;

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

    protected handleLazyLoad(): void {
        if (!this.selectionMode) {
            super.handleLazyLoad();
        }
    }

    reset(): void {
        this.selectionMode = false;
        this.filterQuery = null;
    }

    protected fetchRootItems(): Q.Promise<FetchResponse> {
        if (!this.filterQuery) {
            return super.fetchRootItems();
        }

        this.filterQuery.setFrom(this.getItemCount());

        return this.fetcher.fetchByQuery(this.filterQuery);
    }

    setSelectionMode(selectionMode: boolean): void {
        this.selectionMode = selectionMode;
    }

}