import {requestJson} from '@enonic/ui-utils/request';
import {ARCHIVE_ROOT, getCmsRestUrl} from './cms';

export function restoreArchived(contentIds: string[]): Promise<string> {
    return requestJson<{taskId: string}>(getCmsRestUrl(ARCHIVE_ROOT, 'archive/restore'), {
        method: 'POST',
        body: {contentIds},
    }).match(
        (json) => json.taskId,
        (error) => {
            throw error;
        },
    );
}
