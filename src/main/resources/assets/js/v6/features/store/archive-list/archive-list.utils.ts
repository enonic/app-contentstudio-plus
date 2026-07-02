import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {ContentQuery} from '@enonic/lib-contentstudio/app/content/ContentQuery';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {
    appendChildren,
    collapse,
    createEmptyState,
    expand,
    removeNodes,
    setChildren,
    setLoading,
    setNode,
    setNodes,
    setRootIds,
    type CreateNodeOptions,
} from '@enonic/lib-contentstudio/v6/shared/lib/tree-store';
import {ArchiveContentFetcher} from '../../../../ArchiveContentFetcher';
import {ArchiveContentViewItem} from '../../../../ArchiveContentViewItem';
import {$archiveListLoading, $archiveListRoot, $archiveTreeState} from './archive-list.store';

const fetcher = new ArchiveContentFetcher();
const pendingChildLoads = new Map<string, Promise<void>>();
let activeFilterQuery: ContentQuery | null = null;

export function setArchiveFilterQuery(query: ContentQuery | null): Promise<void> {
    activeFilterQuery = query;
    return loadArchiveItems();
}

export async function loadArchiveItems(): Promise<void> {
    if ($archiveListLoading.get()) {
        return;
    }

    $archiveTreeState.set(createEmptyState<ArchiveContentViewItem>());
    $archiveListRoot.set({total: 0, hasMore: false});
    $archiveListLoading.set(true);

    try {
        const response = activeFilterQuery
            ? await fetcher.fetchByQuery(activeFilterQuery)
            : await fetcher.fetchContents(undefined, 0);

        const items = response.items.map((c) => toViewItem(c));
        const treatAsLeaf = !!activeFilterQuery;
        const nodeOptions = items.map((item) => toNodeOptions(item, null, treatAsLeaf));

        let next = setNodes(createEmptyState<ArchiveContentViewItem>(), nodeOptions);
        next = setRootIds(next, items.map((item) => item.getId()));

        $archiveTreeState.set(next);
        $archiveListRoot.set({
            total: response.total,
            hasMore: items.length < response.total && !activeFilterQuery,
        });
    } catch (error) {
        DefaultErrorHandler.handle(error);
    } finally {
        $archiveListLoading.set(false);
    }
}

export async function loadMoreArchiveItems(): Promise<void> {
    if ($archiveListLoading.get() || !$archiveListRoot.get().hasMore || activeFilterQuery) {
        return;
    }

    $archiveListLoading.set(true);

    try {
        const state = $archiveTreeState.get();
        const response = await fetcher.fetchContents(undefined, state.rootIds.length);
        const items = response.items.map((c) => toViewItem(c));
        const nodeOptions = items.map((item) => toNodeOptions(item, null, false));

        let next = setNodes($archiveTreeState.get(), nodeOptions);
        next = appendChildren(next, null, items.map((item) => item.getId()));

        $archiveTreeState.set(next);
        $archiveListRoot.set({
            total: response.total,
            hasMore: $archiveTreeState.get().rootIds.length < response.total,
        });
    } catch (error) {
        DefaultErrorHandler.handle(error);
    } finally {
        $archiveListLoading.set(false);
    }
}

export function expandArchiveNode(id: string): void {
    const state = $archiveTreeState.get();
    const node = state.nodes.get(id);
    if (!node || state.expandedIds.has(id)) {
        return;
    }

    $archiveTreeState.set(expand(state, id));

    if (node.hasChildren && node.childIds.length === 0) {
        void loadMoreChildrenOf(id);
    }
}

export function collapseArchiveNode(id: string): void {
    $archiveTreeState.set(collapse($archiveTreeState.get(), id));
}

export function removeArchiveItems(ids: readonly string[]): void {
    if (ids.length === 0) {
        return;
    }
    const state = $archiveTreeState.get();
    if (!ids.some((id) => state.nodes.has(id))) {
        return;
    }
    const next = removeNodes(state, [...ids], true);
    const removedFromRoot = state.rootIds.length - next.rootIds.length;

    $archiveTreeState.set(next);
    if (removedFromRoot > 0) {
        const root = $archiveListRoot.get();
        $archiveListRoot.setKey('total', Math.max(0, root.total - removedFromRoot));
    }
}

export function loadMoreChildrenOf(parentId: string): Promise<void> {
    const existing = pendingChildLoads.get(parentId);
    if (existing !== undefined) {
        return existing;
    }

    const state = $archiveTreeState.get();
    const parent = state.nodes.get(parentId);
    if (!parent?.data) {
        return Promise.resolve();
    }
    if (parent.totalChildren !== undefined && parent.childIds.length >= parent.totalChildren) {
        return Promise.resolve();
    }

    const promise = doLoadChildren(parentId).finally(() => {
        pendingChildLoads.delete(parentId);
    });
    pendingChildLoads.set(parentId, promise);
    return promise;
}

async function doLoadChildren(parentId: string): Promise<void> {
    const initial = $archiveTreeState.get();
    const parent = initial.nodes.get(parentId);
    if (!parent?.data) {
        return;
    }

    $archiveTreeState.set(setLoading(initial, parentId, true));

    try {
        const response = await fetcher.fetchContents(parent.data.getContentId(), parent.childIds.length);
        const childItems = response.items.map((c) => toViewItem(c, parent.data));
        const childOptions = childItems.map((item) => toNodeOptions(item, parentId, false));

        let next = setNodes($archiveTreeState.get(), childOptions);
        const currentParent = next.nodes.get(parentId);
        const newChildIds = [...(currentParent?.childIds ?? []), ...childItems.map((item) => item.getId())];
        next = setChildren(next, parentId, newChildIds);
        next = setNode(next, {id: parentId, totalChildren: response.total});
        next = setLoading(next, parentId, false);

        $archiveTreeState.set(next);
    } catch (error) {
        $archiveTreeState.set(setLoading($archiveTreeState.get(), parentId, false));
        DefaultErrorHandler.handle(error);
    }
}

function toNodeOptions(
    item: ArchiveContentViewItem,
    parentId: string | null,
    treatAsLeaf: boolean,
): CreateNodeOptions<ArchiveContentViewItem> {
    return {
        id: item.getId(),
        data: item,
        parentId,
        childIds: [],
        hasChildren: !treatAsLeaf && item.hasChildren(),
    };
}

function toViewItem(content: ContentSummaryAndCompareStatus, parent?: ArchiveContentViewItem): ArchiveContentViewItem {
    const summary = content.getContentSummary();
    const parentPath = parent ? parent.getOriginalParentPath() : computeRootParentPath(content);

    return new ArchiveContentViewItem(parentPath)
        .setContentSummary(summary)
        .setCompareStatus(content.getCompareStatus()) as ArchiveContentViewItem;
}

function computeRootParentPath(content: ContentSummaryAndCompareStatus): string {
    const summary = content.getContentSummary();
    const originalParentPath = summary.getOriginalParentPath();
    const originalName = summary.getOriginalName();

    if (!originalParentPath || !originalName) {
        return content.getPath().toString();
    }

    const separator = originalParentPath.endsWith(ContentPath.NODE_PATH_DIVIDER) ? '' : ContentPath.NODE_PATH_DIVIDER;
    return `${originalParentPath}${separator}${originalName}`;
}
