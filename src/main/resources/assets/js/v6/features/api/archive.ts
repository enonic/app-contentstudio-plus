import {requestJson} from '@enonic/ui-utils/request';
import type {ArchivedContentListJson} from '../../../resource/json/ArchivedContentJson';
import {type ArchivedContent, type ArchivedPage, toArchivedContent} from '../shared/content/archivedContent';
import {ARCHIVE_ROOT, getCmsRestUrl, withParams} from './cms';

const SUMMARY_EXPAND = 1;

const rethrow = (error: Error): never => {
    throw error;
};

/** A page of the children of an archived item, or of the archive root when no parent is given. */
export function fetchArchivedChildren(parentId: string | undefined, from: number, size: number): Promise<ArchivedPage> {
    const url = withParams(getCmsRestUrl(ARCHIVE_ROOT, 'list'), {
        ...(parentId != null && {parentId}),
        expand: SUMMARY_EXPAND,
        from,
        size,
        childOrder: '',
    });

    return requestJson<ArchivedContentListJson>(url).match(
        (json) => ({items: json.contents.map(toArchivedContent), total: json.metadata.totalHits}),
        rethrow,
    );
}

export function fetchArchivedByIds(contentIds: string[]): Promise<ArchivedContent[]> {
    if (contentIds.length === 0) {
        return Promise.resolve([]);
    }

    return requestJson<ArchivedContentListJson>(getCmsRestUrl(ARCHIVE_ROOT, 'resolveByIds'), {
        method: 'POST',
        body: {contentIds},
    }).match((json) => json.contents.map(toArchivedContent), rethrow);
}

export function fetchArchivedDescendantIds(contentPaths: string[]): Promise<string[]> {
    return requestJson<{id: string}[]>(getCmsRestUrl(ARCHIVE_ROOT, 'getDescendantsOfContents'), {
        method: 'POST',
        body: {contentPaths},
    }).match((json) => json.map(({id}) => id), rethrow);
}

/** Starts the deletion and resolves with the id of its task. */
export function deleteArchived(contentPaths: string[]): Promise<string> {
    return requestJson<{taskId: string}>(getCmsRestUrl(ARCHIVE_ROOT, 'delete'), {
        method: 'POST',
        body: {contentPaths},
    }).match((json) => json.taskId, rethrow);
}

/** Starts the restore and resolves with the id of its task. */
export function restoreArchived(contentIds: string[]): Promise<string> {
    return requestJson<{taskId: string}>(getCmsRestUrl(ARCHIVE_ROOT, 'archive/restore'), {
        method: 'POST',
        body: {contentIds},
    }).match((json) => json.taskId, rethrow);
}
