import {computed, task} from 'nanostores';
import type {AttachmentJson} from '@enonic/lib-contentstudio/app/attachment/AttachmentJson';
import {Attachments} from '@enonic/lib-contentstudio/app/attachment/Attachments';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {requestJson} from '@enonic/ui-utils/request';
import {$archiveContextContent} from '../store/archive-selection';
import {ARCHIVE_ROOT, getCmsRestUrl, withParams} from './cms';

export function loadArchiveAttachments(contentId: ContentId): Promise<Attachments | null> {
    const url = withParams(getCmsRestUrl(ARCHIVE_ROOT, 'getAttachments'), {id: contentId.toString()});
    return requestJson<AttachmentJson[]>(url).match(
        (json) => (json.length > 0 ? Attachments.create().fromJson(json).build() : null),
        (error) => {
            throw error;
        },
    );
}

export function getArchiveAttachmentUrl(contentId: ContentId, attachmentName: string): string {
    return getCmsRestUrl(ARCHIVE_ROOT, `media/${contentId.toString()}/${encodeURIComponent(attachmentName)}`);
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
