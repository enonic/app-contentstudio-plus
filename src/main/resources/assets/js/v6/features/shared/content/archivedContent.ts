import type {ArchivedContentJson} from '../../../../resource/json/ArchivedContentJson';
import {joinPath} from './contentPath';

export type ContentState = 'ready' | 'in-progress' | 'invalid';

export type ArchivedContent = {
    id: string;
    name: string;
    path: string;
    displayName: string;
    type: string;
    iconUrl?: string;
    /** The item has an uploaded thumbnail, so `iconUrl` is a picture whatever the type. */
    hasThumbnail: boolean;
    hasChildren: boolean;
    /** The names of the item's attachments. */
    attachments: string[];
    state?: ContentState;
    language?: string;
    creator?: string;
    modifier?: string;
    owner?: string;
    archivedBy?: string;
    createdTime?: Date;
    modifiedTime?: Date;
    archivedTime?: Date;
    firstPublished?: Date;
    /** Where the item lived before it was archived; empty when the server does not know. */
    originalPath: string;
    /** The summary as the server sent it, for the panels that still build Content Studio's own model. */
    source: ArchivedContentJson;
};

export type ArchivedPage = {
    items: ArchivedContent[];
    total: number;
};

const toDate = (value: string | null | undefined): Date | undefined => (value ? new Date(value) : undefined);

// Published content shows no workflow state.
const toState = (json: ArchivedContentJson): ContentState | undefined => {
    if (json.publish?.time) {
        return undefined;
    }
    if (!json.isValid) {
        return 'invalid';
    }
    if (json.workflow?.state === 'READY') {
        return 'ready';
    }
    if (json.workflow?.state === 'IN_PROGRESS') {
        return 'in-progress';
    }
    return undefined;
};

const toOriginalPath = ({originalParentPath, originalName}: ArchivedContentJson): string => {
    if (!originalParentPath || !originalName) {
        return originalParentPath ?? '';
    }
    return joinPath(originalParentPath, originalName);
};

export const toArchivedContent = (json: ArchivedContentJson): ArchivedContent => ({
    id: json.id,
    name: json.name,
    path: json.path,
    displayName: json.displayName,
    type: json.type,
    iconUrl: json.iconUrl ?? undefined,
    hasThumbnail: !!json.thumbnail,
    hasChildren: json.hasChildren,
    attachments: json.attachments ?? [],
    state: toState(json),
    language: json.language ?? undefined,
    creator: json.creator ?? undefined,
    modifier: json.modifier ?? undefined,
    owner: json.owner ?? undefined,
    archivedBy: json.archivedBy ?? undefined,
    createdTime: toDate(json.createdTime),
    modifiedTime: toDate(json.modifiedTime),
    archivedTime: toDate(json.archivedTime),
    firstPublished: toDate(json.publish?.first),
    originalPath: toOriginalPath(json),
    source: json,
});

const isDescendantOf = (path: string, ancestor: string): boolean => path.startsWith(`${ancestor}/`);

/** Drops the items that lie under another item of the same list. */
export function filterTopMost(items: ArchivedContent[]): ArchivedContent[] {
    const result: ArchivedContent[] = [];

    items.forEach((item) => {
        const covered = result.some((other, index) => {
            if (isDescendantOf(item.path, other.path)) {
                return true;
            }
            if (isDescendantOf(other.path, item.path)) {
                result[index] = item;
                return true;
            }
            return false;
        });

        if (!covered) {
            result.push(item);
        }
    });

    return result;
}
