import {requestJson} from '@enonic/ui-utils/request';
import type {ArchivedContentJson, ArchivedContentListJson} from '../../../resource/json/ArchivedContentJson';
import {$config} from '../../../shared/config';
import {getActiveProjectName} from '../../../shared/project';
import {type ArchivedContent, type ArchivedPage, toArchivedContent} from '../shared/content/archivedContent';
import {withParams} from './cms';

const MAX_IDS_PER_REQUEST = 100;

export const getArchiveUrl = (): string => $config.get().services.archiveUrl;

const rethrow = (error: Error): never => {
    throw error;
};

/** Sends an action to the archive API for the active project. */
export function postArchive<T>(action: string, body: Record<string, unknown>): Promise<T> {
    return requestJson<T>(getArchiveUrl(), {
        method: 'POST',
        body: {action, project: getActiveProjectName(), ...body},
    }).match((json) => json, rethrow);
}

/** A page of the children of an archived item, or of the archive root when no parent is given. */
export function fetchArchivedChildren(parentId: string | undefined, from: number, size: number): Promise<ArchivedPage> {
    const url = withParams(getArchiveUrl(), {
        project: getActiveProjectName(),
        ...(parentId != null && {parentId}),
        from,
        size,
    });

    return requestJson<ArchivedContentListJson>(url).match(
        (json) => ({items: json.items.map(toArchivedContent), total: json.total}),
        rethrow,
    );
}

async function fetchArchivedChunk(ids: string[]): Promise<ArchivedContent[]> {
    const {items} = await postArchive<{items: ArchivedContentJson[]}>('get', {ids});

    return items.map(toArchivedContent);
}

/** The archived items with these ids, in the order of the ids; an id the archive does not have is left out. */
export async function fetchArchivedByIds(contentIds: string[]): Promise<ArchivedContent[]> {
    const chunks: string[][] = [];

    for (let index = 0; index < contentIds.length; index += MAX_IDS_PER_REQUEST) {
        chunks.push(contentIds.slice(index, index + MAX_IDS_PER_REQUEST));
    }

    return (await Promise.all(chunks.map(fetchArchivedChunk))).flat();
}

/** The ids of everything below these archived items; the items themselves are left out. */
export async function fetchArchivedDescendantIds(contentIds: string[]): Promise<string[]> {
    return (await postArchive<{ids: string[]}>('descendants', {ids: contentIds})).ids;
}

/** The address that downloads an attachment of an archived item. */
export function getArchivedAttachmentUrl(contentId: string, attachmentName: string): string {
    return withParams(getArchiveUrl(), {project: getActiveProjectName(), attachment: contentId, name: attachmentName});
}

async function startArchiveTask(action: 'delete' | 'restore', contentIds: string[]): Promise<string> {
    return (await postArchive<{taskId: string}>(action, {ids: contentIds})).taskId;
}

/** Starts the deletion and resolves with the id of its task. */
export function deleteArchived(contentIds: string[]): Promise<string> {
    return startArchiveTask('delete', contentIds);
}

/** Starts the restore and resolves with the id of its task. */
export function restoreArchived(contentIds: string[]): Promise<string> {
    return startArchiveTask('restore', contentIds);
}
