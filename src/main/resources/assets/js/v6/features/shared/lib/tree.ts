export type TreeNode<T> = {
    id: string;
    data: T;
    parentId: string | null;
    childIds: string[];
    hasChildren: boolean;
    /** How many children the server has; unknown until the first page of them is loaded. */
    totalChildren?: number;
};

export type TreeState<T> = {
    nodes: Map<string, TreeNode<T>>;
    rootIds: string[];
    expandedIds: Set<string>;
    loadingIds: Set<string>;
};

export type TreeEntry<T> = {
    id: string;
    data: T;
    hasChildren: boolean;
};

/** A visible row: a node, or the placeholder that stands for the children still to load. */
export type FlatNode<T> = {
    id: string;
    data: T | null;
    level: number;
    isExpanded: boolean;
    hasChildren: boolean;
    parentId: string | null;
    nodeType: 'node' | 'loading';
};

const LOADING_NODE_PREFIX = '__loading__';

export function createTree<T>(): TreeState<T> {
    return {nodes: new Map(), rootIds: [], expandedIds: new Set(), loadingIds: new Set()};
}

/** Appends a loaded page under the parent, or at the root when the parent is null. */
export function addChildren<T>(
    state: TreeState<T>,
    parentId: string | null,
    entries: TreeEntry<T>[],
    totalChildren?: number,
): TreeState<T> {
    const parent = parentId === null ? undefined : state.nodes.get(parentId);
    if (parentId !== null && !parent) {
        return state;
    }

    const nodes = new Map(state.nodes);
    entries.forEach(({id, data, hasChildren}) => {
        nodes.set(id, {id, data, parentId, childIds: nodes.get(id)?.childIds ?? [], hasChildren});
    });

    const ids = entries.map(({id}) => id);
    if (!parent) {
        return {...state, nodes, rootIds: [...state.rootIds, ...ids]};
    }

    const childIds = [...parent.childIds, ...ids];
    const total = totalChildren ?? parent.totalChildren;
    nodes.set(parent.id, {...parent, childIds, totalChildren: total, hasChildren: childIds.length > 0 || (total ?? 0) > 0});

    return {...state, nodes};
}

export function setExpanded<T>(state: TreeState<T>, id: string, expanded: boolean): TreeState<T> {
    if (state.expandedIds.has(id) === expanded) {
        return state;
    }

    const expandedIds = new Set(state.expandedIds);
    if (expanded) {
        expandedIds.add(id);
    } else {
        expandedIds.delete(id);
    }

    return {...state, expandedIds};
}

export function setLoading<T>(state: TreeState<T>, id: string, loading: boolean): TreeState<T> {
    const loadingIds = new Set(state.loadingIds);
    if (loading) {
        loadingIds.add(id);
    } else {
        loadingIds.delete(id);
    }

    return {...state, loadingIds};
}

/** Removes the nodes with everything under them. */
export function removeNodes<T>(state: TreeState<T>, ids: readonly string[]): TreeState<T> {
    const removed = new Set<string>();
    const stack = ids.filter((id) => state.nodes.has(id));

    while (stack.length > 0) {
        const id = stack.pop();
        if (id === undefined || removed.has(id)) {
            continue;
        }
        removed.add(id);
        stack.push(...(state.nodes.get(id)?.childIds ?? []));
    }

    if (removed.size === 0) {
        return state;
    }

    const nodes = new Map(state.nodes);
    const orphanedCounts = new Map<string, number>();

    removed.forEach((id) => {
        const parentId = nodes.get(id)?.parentId;
        if (parentId && !removed.has(parentId)) {
            orphanedCounts.set(parentId, (orphanedCounts.get(parentId) ?? 0) + 1);
        }
        nodes.delete(id);
    });

    orphanedCounts.forEach((count, parentId) => {
        const parent = nodes.get(parentId);
        if (!parent) {
            return;
        }
        const childIds = parent.childIds.filter((childId) => !removed.has(childId));
        const totalChildren = parent.totalChildren == null ? undefined : Math.max(0, parent.totalChildren - count);
        nodes.set(parentId, {...parent, childIds, totalChildren, hasChildren: childIds.length > 0 || (totalChildren ?? 0) > 0});
    });

    return {
        nodes,
        rootIds: state.rootIds.filter((id) => !removed.has(id)),
        expandedIds: new Set([...state.expandedIds].filter((id) => !removed.has(id))),
        loadingIds: new Set([...state.loadingIds].filter((id) => !removed.has(id))),
    };
}

/** The rows in display order; levels start at 1, as `VirtualizedTreeList` expects. */
export function flattenTree<T>(state: TreeState<T>): FlatNode<T>[] {
    const result: FlatNode<T>[] = [];

    const visit = (id: string, level: number): void => {
        const node = state.nodes.get(id);
        if (!node) {
            return;
        }

        const isExpanded = state.expandedIds.has(id);
        const hasChildren = node.hasChildren || node.childIds.length > 0;
        result.push({id, data: node.data, level, isExpanded, hasChildren, parentId: node.parentId, nodeType: 'node'});

        if (!isExpanded || !hasChildren) {
            return;
        }

        node.childIds.forEach((childId) => visit(childId, level + 1));

        const loaded = node.childIds.length;
        if (loaded === 0 || state.loadingIds.has(id) || loaded < (node.totalChildren ?? loaded)) {
            result.push({
                id: `${LOADING_NODE_PREFIX}${id}__${loaded}`,
                data: null,
                level: level + 1,
                isExpanded: false,
                hasChildren: false,
                parentId: id,
                nodeType: 'loading',
            });
        }
    };

    state.rootIds.forEach((id) => visit(id, 1));

    return result;
}
