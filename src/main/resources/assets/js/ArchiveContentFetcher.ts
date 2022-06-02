import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import * as Q from 'q';
import {ContentQueryRequest} from 'lib-contentstudio/app/resource/ContentQueryRequest';
import {ContentSummaryJson} from 'lib-contentstudio/app/content/ContentSummaryJson';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {Expand} from '@enonic/lib-admin-ui/rest/Expand';
import {ContentQueryResult} from 'lib-contentstudio/app/resource/ContentQueryResult';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {CompareStatus} from 'lib-contentstudio/app/content/CompareStatus';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {FetchResponse} from './FetchResponse';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ContentResponse} from 'lib-contentstudio/app/resource/ContentResponse';

export class ArchiveContentFetcher
    extends ContentSummaryAndCompareStatusFetcher {

    static readonly FETCH_SIZE: number = 10;

    constructor() {
        super(ArchiveResourceRequest.ARCHIVE_PATH);
    }

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

    fetchContents(parentContentId: ContentId, from: number): Q.Promise<FetchResponse> {
        return this.fetchChildren(parentContentId, from, ArchiveContentFetcher.FETCH_SIZE)
            .then((response: ContentResponse<ContentSummaryAndCompareStatus>) => {
                return {items: response.getContents(), total: response.getMetadata().getTotalHits()};
            });
    }
}
