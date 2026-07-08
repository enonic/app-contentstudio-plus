import type {ContentVersion} from '@enonic/lib-contentstudio/app/ContentVersion';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import type {ContentJson} from '@enonic/lib-contentstudio/app/content/ContentJson';
import {resolveContentSummaries} from '@enonic/lib-contentstudio/v6/entities/content/api/content.api';
import {fetchContentVersions, fetchVersion}
    from '@enonic/lib-contentstudio/v6/entities/content/api/versions.api';
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
            : resolveContentSummaries([cId]).match(
                (summaries) => {
                    const summary = summaries[0];
                    if (summary == null) {
                        throw new Error(`Content not found: ${contentId}`);
                    }
                    return summary;
                },
                (error) => {
                    throw error;
                },
            ),
        fetchContentVersions({contentId: cId}).match(
            (result) => result,
            (error) => {
                throw error;
            },
        ),
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

    const promise = fetchVersion(contentId.toString(), versionId).match(
        (content) => content,
        (error) => {
            throw error;
        },
    );
    versionContentCache.set(versionId, promise);
    return promise;
}
