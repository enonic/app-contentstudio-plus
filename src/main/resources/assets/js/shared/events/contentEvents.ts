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
const PROJECT_ROLE_PREFIX = '/identity/roles/cms.project.';
const DRAFT = 'draft';
const PROJECT_NODE_EVENT_TYPES = new Set(['node.created', 'node.updated', 'node.deleted']);
const PROJECT_ROOT_EVENT_TYPES = new Set(['node.updated', 'node.permissionsUpdated']);
const PROJECTS_CHANGED_DELAY_MS = 300;

const isUnder = (path: string | undefined, root: string): boolean => !!path && path.startsWith(`${root}/`);

const uniqueIds = (nodes: StudioNodeJson[]): string[] => [...new Set(nodes.map((node) => node.id))];

function getEventNodes(event: StudioServerEvent): {path: string; repo?: string}[] {
    const {nodes, path, repo} = event.data ?? {};
    if (nodes) return nodes;
    return path == null ? [] : [{path, repo}];
}

// ! A project is more than its repository node: XP keeps the display name and the language on the
// ! root `/content` node of the project's repository, and the access in the project's roles.
function isProjectChange(event: StudioServerEvent): boolean {
    const nodes = getEventNodes(event);
    const {type} = event;

    if (PROJECT_NODE_EVENT_TYPES.has(type) && nodes.some(({path}) => path.startsWith(PROJECT_NODE_PREFIX))) return true;

    const isProjectRoot = ({path, repo}: {path: string; repo?: string}): boolean =>
        path === CONTENT_ROOT && !!repo?.startsWith(CONTENT_REPO_PREFIX);
    if (PROJECT_ROOT_EVENT_TYPES.has(type) && nodes.some(isProjectRoot)) return true;

    return type === 'node.updated' && nodes.some(({path}) => path.startsWith(PROJECT_ROLE_PREFIX));
}

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

/** Fires once after a burst of project creations, deletions, and changes of settings or access. */
export function subscribeToProjectChanges(listener: () => void): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribeToStudioEvents((event) => {
        if (!isProjectChange(event)) return;

        clearTimeout(timer);
        timer = setTimeout(listener, PROJECTS_CHANGED_DELAY_MS);
    });

    return () => {
        clearTimeout(timer);
        unsubscribe();
    };
}
