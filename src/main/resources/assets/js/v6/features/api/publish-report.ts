import type {ContentVersion} from '@enonic/lib-contentstudio/app/ContentVersion';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import type {ContentJson} from '@enonic/lib-contentstudio/app/content/ContentJson';
import {GetContentSummaryByIdRequest}
    from '@enonic/lib-contentstudio/app/resource/GetContentSummaryByIdRequest';
import {GetContentVersionRequest}
    from '@enonic/lib-contentstudio/app/resource/GetContentVersionRequest';
import {GetContentVersionsRequest}
    from '@enonic/lib-contentstudio/app/resource/GetContentVersionsRequest';
import {ArchiveContentFetcher} from '../../../ArchiveContentFetcher';

export type PublishReportData = {
    path: string;
    versions: ContentVersion[];
};

const versionContentCache = new Map<string, Promise<ContentJson>>();

export async function fetchPublishReportData(
    contentId: string,
    isArchived: boolean,
): Promise<PublishReportData> {
    const cId = new ContentId(contentId);

    const [content, versionsResult] = await Promise.all([
        isArchived
            ? new ArchiveContentFetcher().fetch(cId)
            : new GetContentSummaryByIdRequest(cId).sendAndParse(),
        new GetContentVersionsRequest(cId).sendAndParse(),
    ]);

    return {
        path: content.getPath().toString(),
        versions: versionsResult.getContentVersions(),
    };
}

export function fetchVersionContent(contentId: ContentId, versionId: string): Promise<ContentJson> {
    const cached = versionContentCache.get(versionId);
    if (cached !== undefined) {
        return cached;
    }

    const promise = Promise.resolve(
        new GetContentVersionRequest(contentId)
            .setVersion(versionId)
            .sendRequest()
            .then(stripContentMetadata),
    );
    versionContentCache.set(versionId, promise);
    return promise;
}

function stripContentMetadata(content: ContentJson): ContentJson {
    const cleaned = {...content};
    delete cleaned.hasChildren;
    return cleaned;
}
