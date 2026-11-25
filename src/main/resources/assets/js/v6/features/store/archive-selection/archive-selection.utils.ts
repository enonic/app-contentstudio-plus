import type {ArchivedContent} from '../../shared/content/archivedContent';
import type {TreeState} from '../../shared/lib/tree';
import {$archiveTreeState} from '../archive-list/archive-list.store';
import {$currentItems, $selection, $activeId} from './archive-selection.store';

export function getLoadedIds(state: TreeState<ArchivedContent>): string[] {
    return [...state.nodes.keys()];
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

export function getCurrentItems(): readonly ArchivedContent[] {
    return $currentItems.get();
}
