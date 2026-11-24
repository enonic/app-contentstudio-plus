import {Expand} from '@enonic/lib-admin-ui/rest/Expand';
import type {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import type {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import type {ContentQuery} from '@enonic/lib-contentstudio/app/content/ContentQuery';
import {ContentQueryRequest} from '@enonic/lib-contentstudio/app/resource/ContentQueryRequest';
import Q from 'q';
import {toLegacyViewItem} from './ArchiveLegacyContent';
import type {FetchResponse} from './FetchResponse';
import type {ArchivedContentListJson} from './resource/json/ArchivedContentJson';
import {fetchArchivedChildren} from './v6/features/api/archive';
import {type ArchivedPage, toArchivedContent} from './v6/features/shared/content/archivedContent';

// The query comes from the legacy filter panel, so it goes through its legacy request.
export function fetchArchivedByQuery(filterQuery: ContentQuery): Promise<ArchivedPage> {
    const request = new ContentQueryRequest(filterQuery).setContentRootPath(ContentPath.ARCHIVE_ROOT).setExpand(Expand.SUMMARY);

    return Promise.resolve(request.send()).then((response) => {
        const json = (response as JsonResponse<ArchivedContentListJson>).getResult();
        return {items: json.contents.map(toArchivedContent), total: json.metadata.totalHits};
    });
}

const toFetchResponse = ({items, total}: ArchivedPage): FetchResponse => ({items: items.map(toLegacyViewItem), total});

export class ArchiveContentFetcher {

    static readonly FETCH_SIZE: number = 10;

    fetchByQuery(filterQuery: ContentQuery): Q.Promise<FetchResponse> {
        return Q(fetchArchivedByQuery(filterQuery)).then(toFetchResponse);
    }

    fetchContents(parentContentId: ContentId | undefined, from: number): Q.Promise<FetchResponse> {
        return Q(fetchArchivedChildren(parentContentId?.toString(), from, ArchiveContentFetcher.FETCH_SIZE)).then(toFetchResponse);
    }
}
