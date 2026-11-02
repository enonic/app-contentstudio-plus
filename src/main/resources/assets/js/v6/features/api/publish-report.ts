import {requestJson} from '@enonic/ui-utils/request';
import {getActiveProjectName} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import type {ContentVersionsJson} from '../../../resource/json/ContentVersionJson';
import {$config} from '../../../shared/config';
import {type ContentVersion, toContentVersion} from '../views/context/widget/publish-report/contentVersion';
import {ARCHIVE_ROOT, CONTENT_ROOT, getCmsRestUrl, withParams} from './cms';

export type PublishReportData = {
    path: string;
    versions: ContentVersion[];
};

export type VersionContent = Record<string, unknown>;

const VERSION_METADATA_KEYS = [
    '_id',
    'creator',
    'createdTime',
    'hasChildren',
    'modifiedTime',
    'validationErrors',
    'publish',
    'workflow',
    'valid',
    'originProject',
    'type',
    'owner',
    'modifier',
];

const versionContentCache = new Map<string, Promise<VersionContent>>();

const rethrow = (error: Error): never => {
    throw error;
};

const fetchContentPath = (contentId: string, isArchived: boolean): Promise<string> => {
    const url = withParams(getCmsRestUrl(isArchived ? ARCHIVE_ROOT : CONTENT_ROOT, ''), {id: contentId});

    return requestJson<{path: string}>(url).match((json) => json.path, rethrow);
};

const fetchContentVersions = (contentId: string): Promise<ContentVersion[]> =>
    requestJson<ContentVersionsJson>(getCmsRestUrl(CONTENT_ROOT, 'getVersions'), {
        method: 'POST',
        body: {contentId, size: -1},
    }).match((json) => json.contentVersions.map(toContentVersion), rethrow);

export async function fetchPublishReportData(contentId: string, isArchived: boolean): Promise<PublishReportData> {
    const [path, versions] = await Promise.all([fetchContentPath(contentId, isArchived), fetchContentVersions(contentId)]);

    return {path, versions};
}

const stripMetadata = (content: VersionContent): VersionContent => {
    const cleaned = {...content};
    VERSION_METADATA_KEYS.forEach((key) => {
        delete cleaned[key];
    });
    return cleaned;
};

export function fetchVersionContent(contentId: string, versionId: string): Promise<VersionContent> {
    const cached = versionContentCache.get(versionId);
    if (cached !== undefined) {
        return cached;
    }

    const url = withParams($config.get().services.contentUrl, {
        contentId,
        versionId,
        repositoryId: `com.enonic.cms.${getActiveProjectName()}`,
    });
    const promise = requestJson<VersionContent>(url).match(stripMetadata, rethrow);
    versionContentCache.set(versionId, promise);
    return promise;
}
