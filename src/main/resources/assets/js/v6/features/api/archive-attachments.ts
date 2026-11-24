import {requestJson} from '@enonic/ui-utils/request';
import {computed, task} from 'nanostores';
import {$archiveContextContent} from '../store/archive-selection';
import {ARCHIVE_ROOT, getCmsRestUrl, withParams} from './cms';

/** The names of the attachments of an archived item. */
export function loadArchiveAttachments(contentId: string): Promise<string[]> {
    const url = withParams(getCmsRestUrl(ARCHIVE_ROOT, 'getAttachments'), {id: contentId});
    return requestJson<{name: string}[]>(url).match(
        (json) => json.map(({name}) => name),
        (error) => {
            throw error;
        },
    );
}

export function getArchiveAttachmentUrl(contentId: string, attachmentName: string): string {
    return getCmsRestUrl(ARCHIVE_ROOT, `media/${contentId}/${encodeURIComponent(attachmentName)}`);
}

export const $archiveAttachments = computed($archiveContextContent, (content) =>
    task(async () => {
        if (!content) return [];
        try {
            return await loadArchiveAttachments(content.id);
        } catch (error) {
            console.error(error);
            return [];
        }
    }),
);
