import {getActiveProjectName} from '../project';
import {type StudioNodeJson, type StudioServerEvent, subscribeToStudioEvents} from './studioSocket';

export interface ContentNode {
    id: string;
    path: string;
}

export interface ContentEventHandlers {
    onUpdated?: (ids: string[]) => void;
    onDeleted?: (ids: string[]) => void;
    onDuplicated?: (nodes: ContentNode[]) => void;
}

const CONTENT_REPO_PREFIX = 'com.enonic.cms.';
const CONTENT_ROOT = '/content';
const ARCHIVE_ROOT = '/archive';
const PROJECT_NODE_PREFIX = `/repository/${CONTENT_REPO_PREFIX}`;
const DRAFT = 'draft';
const PROJECT_EVENT_TYPES = new Set(['node.created', 'node.updated', 'node.deleted']);
const PROJECTS_CHANGED_DELAY_MS = 300;

const isUnder = (path: string | undefined, root: string): boolean => !!path && path.startsWith(`${root}/`);

const uniqueIds = (nodes: StudioNodeJson[]): string[] => [...new Set(nodes.map((node) => node.id))];

function toContentEvent(event: StudioServerEvent, handlers: ContentEventHandlers): void {
    const repo = `${CONTENT_REPO_PREFIX}${getActiveProjectName()}`;
    const nodes = (event.data?.nodes ?? []).filter((node) => node.repo === repo && isUnder(node.path, CONTENT_ROOT));
    if (nodes.length === 0) return;

    switch (event.type) {
        case 'node.updated':
            handlers.onUpdated?.(uniqueIds(nodes));
            break;
        case 'node.duplicated':
            handlers.onDuplicated?.(nodes.map(({id, path}) => ({id, path: path.slice(CONTENT_ROOT.length)})));
            break;
        case 'node.deleted': {
            const deleted = nodes.filter((node) => node.branch === DRAFT);
            if (deleted.length > 0) handlers.onDeleted?.(uniqueIds(deleted));
            break;
        }
        case 'node.moved': {
            const archived = nodes.filter((node) => isUnder(node.newPath, ARCHIVE_ROOT));
            if (archived.length > 0) handlers.onDeleted?.(uniqueIds(archived));
            break;
        }
    }
}

/** Changes to the content of the active project. Archiving counts as a deletion. */
export function subscribeToContentEvents(handlers: ContentEventHandlers): () => void {
    return subscribeToStudioEvents((event) => toContentEvent(event, handlers));
}

/** Fires once after a burst of project creations, updates and deletions. */
export function subscribeToProjectChanges(listener: () => void): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribeToStudioEvents((event) => {
        if (!PROJECT_EVENT_TYPES.has(event.type)) return;
        if (!event.data?.nodes?.some((node) => node.path.startsWith(PROJECT_NODE_PREFIX))) return;

        clearTimeout(timer);
        timer = setTimeout(listener, PROJECTS_CHANGED_DELAY_MS);
    });

    return () => {
        clearTimeout(timer);
        unsubscribe();
    };
}
