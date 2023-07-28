import {AggregationGroupView} from '@enonic/lib-admin-ui/aggregation/AggregationGroupView';
import {BrowseFilterPanel} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterPanel';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentAggregation} from 'lib-contentstudio/app/browse/filter/ContentAggregation';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import * as Q from 'q';
import {Aggregation} from '@enonic/lib-admin-ui/aggregation/Aggregation';
import {LoginResult} from '@enonic/lib-admin-ui/security/auth/LoginResult';
import {IsAuthenticatedRequest} from '@enonic/lib-admin-ui/security/auth/IsAuthenticatedRequest';
import {BucketAggregation} from '@enonic/lib-admin-ui/aggregation/BucketAggregation';
import {Bucket} from '@enonic/lib-admin-ui/aggregation/Bucket';
import {ArchiveAggregation} from './ArchiveAggregation';
import {ArchiveAggregationsDisplayNamesResolver} from './ArchiveAggregationsDisplayNamesResolver';
import {FilterableAggregationGroupView} from 'lib-contentstudio/app/browse/filter/FilterableAggregationGroupView';
import {AggregationsQueryResult} from 'lib-contentstudio/app/browse/filter/AggregationsQueryResult';
import {ArchiveAggregationsFetcher} from './ArchiveAggregationsFetcher';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveServerEvent} from 'lib-contentstudio/app/event/ArchiveServerEvent';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';


export class ArchiveFilterPanel
    extends BrowseFilterPanel<ArchiveViewItem> {

    private aggregations: Map<string, AggregationGroupView>;

    private aggregationsDisplayNamesResolver: ArchiveAggregationsDisplayNamesResolver;

    private aggregationsFetcher: ArchiveAggregationsFetcher;

    private searchEventListeners: ((query?: ContentQuery) => void)[] = [];

    private userInfo: LoginResult;

    constructor() {
        super();

        this.aggregationsDisplayNamesResolver = new ArchiveAggregationsDisplayNamesResolver();
        this.aggregationsFetcher = new ArchiveAggregationsFetcher(this.getAggregationsList());
        this.aggregationsFetcher.setRootPath(ArchiveResourceRequest.ARCHIVE_PATH);
        this.initAggregationGroupView();

        this.initListeners();
   }

    onSearchEvent(listener: (query?: ContentQuery) => void): void {
        this.searchEventListeners.push(listener);
   }

    unSearchEvent(listener: (query?: ContentQuery) => void): void {
        this.searchEventListeners = this.searchEventListeners.filter((curr: (query?: ContentQuery) => void) => {
            return curr !== listener;
       });
   }

    doSearch(): Q.Promise<void> {
        if (this.hasFilterSet()) {
            return this.getAndUpdateAggregations().then(() => {
                this.notifySearchEvent(this.aggregationsFetcher.createContentQuery(this.getSearchInputValues()));
                return Q.resolve();
           });
       }

        return this.resetFacets();
   }

    protected resetFacets(_suppressEvent?: boolean, _doResetAll?: boolean): Q.Promise<void> {
        return this.getAndUpdateAggregations().then(() => {
            this.notifySearchEvent();
            return Q.resolve();
       });
   }

    protected getGroupViews(): AggregationGroupView[] {
        this.aggregations = new Map<string, AggregationGroupView>();

        this.aggregations.set(ContentAggregation.CONTENT_TYPE,
            new AggregationGroupView(ContentAggregation.CONTENT_TYPE, i18n(`field.${ContentAggregation.CONTENT_TYPE as string}`)));

        this.aggregations.set(ArchiveAggregation.ARCHIVED,
            new AggregationGroupView(ArchiveAggregation.ARCHIVED, i18n(`field.${ArchiveAggregation.ARCHIVED}`)));

        this.aggregations.set(ArchiveAggregation.ARCHIVED_BY,
            new FilterableAggregationGroupView(ArchiveAggregation.ARCHIVED_BY, i18n(`field.${ArchiveAggregation.ARCHIVED_BY}`)));

        this.aggregations.set(ContentAggregation.OWNER,
            new FilterableAggregationGroupView(ContentAggregation.OWNER, i18n(`field.${ContentAggregation.OWNER as string}`)));

        this.aggregations.set(ContentAggregation.LANGUAGE,
            new AggregationGroupView(ContentAggregation.LANGUAGE, i18n(`field.${ContentAggregation.LANGUAGE as string}`)));

        return Array.from(this.aggregations.values());
   }

    private getAndUpdateAggregations(): Q.Promise<AggregationsQueryResult> {
        return this.getAggregations().then((aggregationsQueryResult: AggregationsQueryResult) => {
            this.updateHitsCounter(aggregationsQueryResult.getMetadata().getTotalHits());
            return this.processAggregations(aggregationsQueryResult.getAggregations()).then(() => {
                return aggregationsQueryResult;
           });
       });
   }

    private processAggregations(aggregations: Aggregation[]): Q.Promise<void> {
        this.toggleAggregationsVisibility(aggregations);

        return this.aggregationsDisplayNamesResolver.updateAggregationsDisplayNames(aggregations, this.getCurrentUserKeyAsString()).then(
            () => {
                this.updateAggregations(aggregations);
                return Q.resolve();
           });
   }

    private getAggregations(): Q.Promise<AggregationsQueryResult> {
        this.aggregationsFetcher.setSearchInputValues(this.getSearchInputValues());
        this.aggregationsFetcher.setConstraintItemsIds(this.hasConstraint() ? this.getSelectionItems() : null);

        return this.aggregationsFetcher.getAggregations();
   }

    private initAggregationGroupView(): void {
        new IsAuthenticatedRequest().sendAndParse().then((loginResult: LoginResult) => {
            this.userInfo = loginResult;
            (this.aggregations.get(ContentAggregation.OWNER) as FilterableAggregationGroupView).setIdsToKeepOnToTop(
                [this.getCurrentUserKeyAsString()]);
            (this.aggregations.get(ArchiveAggregation.ARCHIVED_BY) as FilterableAggregationGroupView).setIdsToKeepOnToTop(
                [this.getCurrentUserKeyAsString()]);

            return this.getAndUpdateAggregations();
       }).catch(DefaultErrorHandler.handle);
   }

    private getCurrentUserKeyAsString(): string {
        return this.userInfo.getUser().getKey().toString();
   }

    private notifySearchEvent(query?: ContentQuery): void {
        this.searchEventListeners.forEach((listener: (q?: ContentQuery) => void) => {
            listener(query);
       });
   }

    private toggleAggregationsVisibility(aggregations: Aggregation[]): void {
        aggregations.forEach((aggregation: BucketAggregation) => {
            const isAggregationVisible: boolean = aggregation.getBuckets().some((bucket: Bucket) => bucket.docCount > 0);
            this.aggregations.get(aggregation.getName()).setVisible(isAggregationVisible);
       });
   }

    private getAggregationsList(): string[] {
        return Array.from(this.aggregations.keys());
   }

    private initListeners(): void {
        let isRefreshTriggered = false;
        let isFullReset = false;

        const debouncedReset = AppHelper.debounce(() => {
            isRefreshTriggered = false;

            if (isFullReset) {
                isFullReset = false;
                this.reset().catch(DefaultErrorHandler.handle);
           } else {
                this.resetFacets().catch(DefaultErrorHandler.handle);
           }
       }, 500);

        const refreshRequiredHandler = (): void => {
            if (!isRefreshTriggered) {
                isRefreshTriggered = true;

                this.whenShown(() => {
                    debouncedReset();
               });
           }
       };

        ProjectContext.get().onProjectChanged(() => {
            isFullReset = true;
            refreshRequiredHandler();
       });

        ArchiveServerEvent.on((event) => {
            const changeType = event.getNodeChange().getChangeType();

            if (changeType === NodeServerChangeType.MOVE || changeType === NodeServerChangeType.DELETE) {
                isFullReset = true;
           }

            refreshRequiredHandler();
       });
   }
}
