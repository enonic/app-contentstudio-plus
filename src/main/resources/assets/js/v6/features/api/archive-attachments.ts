import {computed, task} from 'nanostores';
import type {AttachmentJson} from '@enonic/lib-contentstudio/app/attachment/AttachmentJson';
import {Attachments} from '@enonic/lib-contentstudio/app/attachment/Attachments';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {$projects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {requestJson} from '@enonic/lib-contentstudio/v6/shared/api/client';
import {getCmsRestUri} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';
import {$archiveContextContent} from '../store/archive-selection';

function getArchiveCmsPath(endpoint: string): string {
    const project = $projects.get().activeProjectId ?? '';
    return `cms/${project}/${ContentPath.ARCHIVE_ROOT}/content/${endpoint}`;
}

export function loadArchiveAttachments(contentId: ContentId): Promise<Attachments | null> {
    const url = `${getCmsRestUri(getArchiveCmsPath('getAttachments'))}?id=${encodeURIComponent(contentId.toString())}`;
    return requestJson<AttachmentJson[]>(url).match(
        (json) => (json.length > 0 ? Attachments.create().fromJson(json).build() : null),
        (error) => {
            throw error;
        },
    );
}

export function getArchiveAttachmentUrl(contentId: ContentId, attachmentName: string): string {
    return getCmsRestUri(getArchiveCmsPath(`media/${contentId.toString()}/${encodeURIComponent(attachmentName)}`));
}

export const $archiveAttachments = computed($archiveContextContent, (content) =>
    task(async () => {
        if (!content) return null;
        try {
            return await loadArchiveAttachments(content.getContentId());
        } catch (error) {
            console.error(error);
            return null;
        }
    }),
);
