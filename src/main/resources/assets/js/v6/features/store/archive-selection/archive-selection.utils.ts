import type {TreeState} from '@enonic/lib-contentstudio/v6/features/lib/tree-store';
import {ArchiveContentViewItem} from '../../../../ArchiveContentViewItem';
import {$archiveTreeState} from '../archive-list/archive-list.store';
import {$currentItems, $selection, $activeId} from './archive-selection.store';

export function getLoadedIds(state: TreeState<ArchiveContentViewItem>): string[] {
    const ids: string[] = [];
    state.nodes.forEach((node, id) => {
        if (node.data) {
            ids.push(id);
        }
    });
    return ids;
}

export function setActive(id: string | null): void {
    $activeId.set(id);
}

export function toggleSelection(id: string): void {
    const current = $selection.get();
    const next = new Set(current);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    $selection.set(next);
}

export function setSelection(ids: string[] | ReadonlySet<string>): void {
    const next = ids instanceof Set ? ids : new Set(ids);
    $selection.set(next);
}

export function clearSelection(): void {
    $selection.set(new Set());
}

export function selectAll(): void {
    $selection.set(new Set(getLoadedIds($archiveTreeState.get())));
}

export function getCurrentItems(): readonly ArchiveContentViewItem[] {
    return $currentItems.get();
}
