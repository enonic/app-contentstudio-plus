import type {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import Q from 'q';
import {toLegacyViewItem} from './ArchiveLegacyContent';
import type {FetchResponse} from './FetchResponse';
import {fetchArchivedChildren} from './v6/features/api/archive';
import type {ArchivedPage} from './v6/features/shared/content/archivedContent';

const toFetchResponse = ({items, total}: ArchivedPage): FetchResponse => ({items: items.map(toLegacyViewItem), total});

export class ArchiveContentFetcher {

    static readonly FETCH_SIZE: number = 10;

    fetchContents(parentContentId: ContentId | undefined, from: number): Q.Promise<FetchResponse> {
        return Q(fetchArchivedChildren(parentContentId?.toString(), from, ArchiveContentFetcher.FETCH_SIZE)).then(toFetchResponse);
    }
}
