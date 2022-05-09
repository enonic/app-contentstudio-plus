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
import {ArchiveViewItem} from './ArchiveViewItem';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {Expand} from 'lib-admin-ui/rest/Expand';
import * as Q from 'q';
import {Aggregation} from 'lib-admin-ui/aggregation/Aggregation';
import {LoginResult} from 'lib-admin-ui/security/auth/LoginResult';
import {IsAuthenticatedRequest} from 'lib-admin-ui/security/auth/IsAuthenticatedRequest';
import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';
import {Bucket} from 'lib-admin-ui/aggregation/Bucket';
import {ArchiveAggregation} from './ArchiveAggregation';
import {SearchArchiveQueryCreator} from './SearchArchiveQueryCreator';
import {ArchiveAggregationsDisplayNamesResolver} from './ArchiveAggregationsDisplayNamesResolver';

export class ArchiveFilterPanel
    extends BrowseFilterPanel<ArchiveViewItem> {

    private aggregations: Map<string, AggregationGroupView>;

    private aggregationsDisplayNamesResolver: ArchiveAggregationsDisplayNamesResolver;

    private searchEventListeners: { (query?: ContentQuery): void; }[] = [];

    private userInfo: LoginResult;

    constructor() {
        super();

        this.aggregationsDisplayNamesResolver = new ArchiveAggregationsDisplayNamesResolver();
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

        this.aggregations.set(ArchiveAggregation.ARCHIVER,
            new AggregationGroupView(ArchiveAggregation.ARCHIVER, i18n(`field.${ArchiveAggregation.ARCHIVER}`)));

        this.aggregations.set(ContentAggregation.OWNER,
            new AggregationGroupView(ContentAggregation.OWNER, i18n(`field.${ContentAggregation.OWNER}`)));

        this.aggregations.set(ContentAggregation.LANGUAGE,
            new AggregationGroupView(ContentAggregation.LANGUAGE, i18n(`field.${ContentAggregation.LANGUAGE}`)));

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
        new IsAuthenticatedRequest().sendAndParse().then((loginResult: LoginResult) => {
            this.userInfo = loginResult;
            this.searchDataAndHandleResponse(this.buildQuery()).catch(DefaultErrorHandler.handle);

            return Q.resolve();
        }).catch(DefaultErrorHandler.handle);
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
        this.aggregationsDisplayNamesResolver.updateAggregationsDisplayNames(aggregations, this.getCurrentUserKeyAsString()).then(() => {
            this.updateAggregations(aggregations);
            return Q.resolve();
        }).catch(DefaultErrorHandler.handle);
        this.toggleAggregationsVisibility(aggregations);
        this.updateHitsCounter(contentQueryResult.getMetadata().getTotalHits());
    }

    private getCurrentUserKeyAsString(): string {
        return this.userInfo.getUser().getKey().toString();
    }

    private buildQuery(): ContentQuery {
        const queryCreator: SearchArchiveQueryCreator = new SearchArchiveQueryCreator(this.getSearchInputValues());

        queryCreator.setIsAggregation(true);
        queryCreator.setConstraintItemsIds(this.hasConstraint() ? this.getSelectionItems() : null);

        return queryCreator.create(
            [ContentAggregation.CONTENT_TYPE, ArchiveAggregation.ARCHIVER, ContentAggregation.OWNER, ContentAggregation.LANGUAGE]);
    }

    private notifySearchEvent(query?: ContentQuery): void {
        this.searchEventListeners.forEach((listener: { (q?: ContentQuery): void; }) => {
            listener(query);
        });
    }

    private toggleAggregationsVisibility(aggregations: Aggregation[]): void {
        aggregations.forEach((aggregation: BucketAggregation) => {
            const isAggregationVisible: boolean = aggregation.getBuckets().some((bucket: Bucket) => bucket.docCount > 0);
            this.aggregations.get(aggregation.getName()).setVisible(isAggregationVisible);
        });
    }
}