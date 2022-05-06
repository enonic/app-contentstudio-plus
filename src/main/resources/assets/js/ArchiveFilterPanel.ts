import {AggregationGroupView} from 'lib-admin-ui/aggregation/AggregationGroupView';
import {BrowseFilterPanel} from 'lib-admin-ui/app/browse/filter/BrowseFilterPanel';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ContentAggregation} from 'lib-contentstudio/app/browse/filter/ContentAggregation';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {ContentSummaryJson} from 'lib-contentstudio/app/content/ContentSummaryJson';
import {ContentQueryRequest} from 'lib-contentstudio/app/resource/ContentQueryRequest';
import {ContentQueryResult} from 'lib-contentstudio/app/resource/ContentQueryResult';
import {SearchContentQueryCreator} from 'lib-contentstudio/app/browse/filter/SearchContentQueryCreator';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {Expand} from 'lib-admin-ui/rest/Expand';
import * as Q from 'q';
import {AggregationsDisplayNamesResolver} from 'lib-contentstudio/app/browse/filter/AggregationsDisplayNamesResolver';
import {Aggregation} from 'lib-admin-ui/aggregation/Aggregation';

export class ArchiveFilterPanel
    extends BrowseFilterPanel<ArchiveViewItem> {

    private aggregations: Map<string, AggregationGroupView>;

    private aggregationsDisplayNamesResolver: AggregationsDisplayNamesResolver;

    private searchEventListeners: { (query?: ContentQuery): void; }[] = [];

    constructor() {
        super();

        this.aggregationsDisplayNamesResolver = new AggregationsDisplayNamesResolver();
        this.initAggregationGroupView();
    }

    onSearchEvent(listener: { (query?: ContentQuery): void; }): void {
        this.searchEventListeners.push(listener);
    }

    unSearchEvent(listener: { (query?: ContentQuery): void; }): void {
        this.searchEventListeners = this.searchEventListeners.filter((curr: { (query?: ContentQuery): void; }) => {
            return curr !== listener;
        });
    }

    protected getGroupViews(): AggregationGroupView[] {
        this.aggregations = new Map<string, AggregationGroupView>();

        this.aggregations.set(ContentAggregation.CONTENT_TYPE,
            new AggregationGroupView(ContentAggregation.CONTENT_TYPE, i18n(`field.${ContentAggregation.CONTENT_TYPE}`)));

        return Array.from(this.aggregations.values());
    }

    protected doSearch(): Q.Promise<void> {
        if (this.hasFilterSet()) {
            const query: ContentQuery = this.buildQuery();

            return this.searchDataAndHandleResponse(query).then(() => {
                this.notifySearchEvent(query);
                return Q.resolve();
            });
        }

        return this.resetFacets();
    }

    protected resetFacets(_suppressEvent?: boolean, _doResetAll?: boolean): Q.Promise<void> {
        return this.searchDataAndHandleResponse(this.buildQuery()).then(() => {
            this.notifySearchEvent();
            return Q.resolve();
        });
    }

    private initAggregationGroupView(): void {
        this.searchDataAndHandleResponse(this.buildQuery()).catch(DefaultErrorHandler.handle);
    }

    private searchDataAndHandleResponse(contentQuery: ContentQuery): Q.Promise<void> {
        return this.sendContentQueryRequest(contentQuery).then(
            (contentQueryResult: ContentQueryResult<ContentSummary, ContentSummaryJson>) => {
                this.processSearchResponse(contentQueryResult);
                return Q.resolve();
            })
            .catch(DefaultErrorHandler.handle);
    }

    private sendContentQueryRequest(contentQuery: ContentQuery): Q.Promise<ContentQueryResult<ContentSummary, ContentSummaryJson>> {
        return new ContentQueryRequest<ContentSummaryJson, ContentSummary>(contentQuery)
            .setExpand(Expand.SUMMARY)
            .setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH)
            .sendAndParse();
    }

    private processSearchResponse(contentQueryResult: ContentQueryResult<ContentSummary, ContentSummaryJson>): void {
        const aggregations: Aggregation[] = contentQueryResult.getAggregations();
        this.updateAggregations(aggregations);
        this.aggregationsDisplayNamesResolver.updateContentTypeAggregations(aggregations).then(() => {
            this.updateAggregations(aggregations);
        }).catch(DefaultErrorHandler.handle);
        this.updateHitsCounter(contentQueryResult.getMetadata().getTotalHits());
    }

    private buildQuery(): ContentQuery {
        const queryCreator: SearchContentQueryCreator = new SearchContentQueryCreator(this.getSearchInputValues());

        queryCreator.setIsAggregation(true);
        queryCreator.setConstraintItemsIds(this.hasConstraint() ? this.getSelectionItems() : null);

        return queryCreator.create([ContentAggregation.CONTENT_TYPE]);
    }

    private notifySearchEvent(query?: ContentQuery): void {
        this.searchEventListeners.forEach((listener: { (q?: ContentQuery): void; }) => {
            listener(query);
        });
    }
}