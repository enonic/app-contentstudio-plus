import {handleError} from '../../../../shared/errors';
import {fetchArchivedChildren} from '../../api/archive';
import type {ArchivedContent, ArchivedPage} from '../../shared/content/archivedContent';
import {addChildren, createTree, removeNodes, setExpanded, setLoading, type TreeEntry} from '../../shared/lib/tree';
import {$archiveListLoading, $archiveListRoot, $archiveTreeState} from './archive-list.store';

export type ArchiveFilter = () => Promise<ArchivedPage>;

const PAGE_SIZE = 10;

const pendingChildLoads = new Map<string, Promise<void>>();
let activeFilter: ArchiveFilter | null = null;
let lastRootLoad = 0;

/** Replaces the tree with what the filter finds, as a flat list; null brings the tree back. */
export function setArchiveFilter(filter: ArchiveFilter | null): Promise<void> {
    activeFilter = filter;
    return loadArchiveItems();
}

export async function loadArchiveItems(): Promise<void> {
    const load = ++lastRootLoad;

    $archiveTreeState.set(createTree<ArchivedContent>());
    $archiveListRoot.set({total: 0, hasMore: false});
    $archiveListLoading.set(true);

    try {
        const isFiltered = !!activeFilter;
        const page = activeFilter ? await activeFilter() : await fetchArchivedChildren(undefined, 0, PAGE_SIZE);

        if (load !== lastRootLoad) {
            return;
        }

        $archiveTreeState.set(addChildren(createTree<ArchivedContent>(), null, toEntries(page.items, isFiltered)));
        $archiveListRoot.set({
            total: page.total,
            hasMore: page.items.length < page.total && !isFiltered,
        });
    } catch (error) {
        if (load === lastRootLoad) {
            handleError(error);
        }
    } finally {
        if (load === lastRootLoad) {
            $archiveListLoading.set(false);
        }
    }
}

export async function loadMoreArchiveItems(): Promise<void> {
    if ($archiveListLoading.get() || !$archiveListRoot.get().hasMore || activeFilter) {
        return;
    }

    const load = lastRootLoad;

    $archiveListLoading.set(true);

    try {
        const page = await fetchArchivedChildren(undefined, $archiveTreeState.get().rootIds.length, PAGE_SIZE);

        if (load !== lastRootLoad) {
            return;
        }

        const next = addChildren($archiveTreeState.get(), null, toEntries(page.items, false));

        $archiveTreeState.set(next);
        $archiveListRoot.set({total: page.total, hasMore: next.rootIds.length < page.total});
    } catch (error) {
        if (load === lastRootLoad) {
            handleError(error);
        }
    } finally {
        if (load === lastRootLoad) {
            $archiveListLoading.set(false);
        }
    }
}

export function expandArchiveNode(id: string): void {
    const state = $archiveTreeState.get();
    const node = state.nodes.get(id);
    if (!node || state.expandedIds.has(id)) {
        return;
    }

    $archiveTreeState.set(setExpanded(state, id, true));

    if (node.hasChildren && node.childIds.length === 0) {
        void loadMoreChildrenOf(id);
    }
}

export function collapseArchiveNode(id: string): void {
    $archiveTreeState.set(setExpanded($archiveTreeState.get(), id, false));
}

export function removeArchiveItems(ids: readonly string[]): void {
    const state = $archiveTreeState.get();
    const next = removeNodes(state, ids);
    if (next === state) {
        return;
    }

    const removedFromRoot = state.rootIds.length - next.rootIds.length;

    $archiveTreeState.set(next);
    if (removedFromRoot > 0) {
        $archiveListRoot.setKey('total', Math.max(0, $archiveListRoot.get().total - removedFromRoot));
    }
}

export function loadMoreChildrenOf(parentId: string): Promise<void> {
    const existing = pendingChildLoads.get(parentId);
    if (existing !== undefined) {
        return existing;
    }

    const parent = $archiveTreeState.get().nodes.get(parentId);
    if (!parent) {
        return Promise.resolve();
    }
    if (parent.totalChildren !== undefined && parent.childIds.length >= parent.totalChildren) {
        return Promise.resolve();
    }

    const promise = doLoadChildren(parentId, parent.childIds.length).finally(() => {
        pendingChildLoads.delete(parentId);
    });
    pendingChildLoads.set(parentId, promise);
    return promise;
}

async function doLoadChildren(parentId: string, from: number): Promise<void> {
    $archiveTreeState.set(setLoading($archiveTreeState.get(), parentId, true));

    try {
        const page = await fetchArchivedChildren(parentId, from, PAGE_SIZE);
        const next = addChildren($archiveTreeState.get(), parentId, toEntries(page.items, false), page.total);

        $archiveTreeState.set(setLoading(next, parentId, false));
    } catch (error) {
        $archiveTreeState.set(setLoading($archiveTreeState.get(), parentId, false));
        handleError(error);
    }
}

function toEntries(items: ArchivedContent[], asLeaves: boolean): TreeEntry<ArchivedContent>[] {
    return items.map((item) => ({id: item.id, data: item, hasChildren: !asLeaves && item.hasChildren}));
}
