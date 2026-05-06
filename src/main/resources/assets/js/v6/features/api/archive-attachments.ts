import {computed, task} from 'nanostores';
import {Attachments} from '@enonic/lib-contentstudio/app/attachment/Attachments';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {GetContentAttachmentsRequest} from '@enonic/lib-contentstudio/app/resource/GetContentAttachmentsRequest';
import {$projects} from '@enonic/lib-contentstudio/v6/features/store/projects.store';
import {getCmsRestUri} from '@enonic/lib-contentstudio/v6/features/utils/url/cms';
import {$archiveContextContent} from '../store/archive-selection';

function getArchiveCmsPath(endpoint: string): string {
    const project = $projects.get().activeProjectId ?? '';
    return `cms/${project}/${ContentPath.ARCHIVE_ROOT}/content/${endpoint}`;
}

export async function loadArchiveAttachments(contentId: ContentId): Promise<Attachments | null> {
    const request = new GetContentAttachmentsRequest(contentId).setContentRootPath(ContentPath.ARCHIVE_ROOT);
    return request.sendAndParse();
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
