import {Expand} from '@enonic/lib-admin-ui/rest/Expand';
import {CompareStatus} from '@enonic/lib-contentstudio/app/content/CompareStatus';
import type {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import type {ContentQuery} from '@enonic/lib-contentstudio/app/content/ContentQuery';
import type {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ContentSummaryJson} from '@enonic/lib-contentstudio/app/content/ContentSummaryJson';
import {ContentQueryRequest} from '@enonic/lib-contentstudio/app/resource/ContentQueryRequest';
import type {ContentQueryResult} from '@enonic/lib-contentstudio/app/resource/ContentQueryResult';
import Q from 'q';
import type {FetchResponse} from './FetchResponse';
import {fetchArchivedChildren} from './v6/features/api/archive';

export class ArchiveContentFetcher {

    static readonly FETCH_SIZE: number = 10;

    // The query comes from the legacy filter panel, so it goes through its legacy request.
    fetchByQuery(filterQuery: ContentQuery): Q.Promise<FetchResponse> {
        return new ContentQueryRequest<ContentSummaryJson, ContentSummary>(filterQuery)
            .setContentRootPath(ContentPath.ARCHIVE_ROOT)
            .setExpand(Expand.SUMMARY)
            .sendAndParse()
            .then((result: ContentQueryResult<ContentSummary, ContentSummaryJson>) => {
                const items: ContentSummaryAndCompareStatus[] = result.getContents().map(
                    (item: ContentSummary) => ContentSummaryAndCompareStatus.fromContentAndCompareStatus(item, CompareStatus.ARCHIVED));
                return {items: items, total: result.getMetadata().getTotalHits()};
            });
    }

    fetchContents(parentContentId: ContentId | undefined, from: number): Q.Promise<FetchResponse> {
        return Q(fetchArchivedChildren(parentContentId?.toString(), from, ArchiveContentFetcher.FETCH_SIZE));
    }
}
