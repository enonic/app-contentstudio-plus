import {atom, computed} from 'nanostores';
import {ArchiveContentViewItem} from '../../../../ArchiveContentViewItem';
import {$archiveTreeState, getArchiveItem} from '../archive-list/archive-list.store';
import {getLoadedIds} from './archive-selection.utils';

export const $selection = atom<ReadonlySet<string>>(new Set());
export const $activeId = atom<string | null>(null);

export const $currentIds = computed([$selection, $activeId], (selection, activeId) => {
    if (selection.size > 0) {
        return [...selection];
    }
    return activeId ? [activeId] : [];
});

export const $currentItems = computed($currentIds, (ids) =>
    ids.map((id) => getArchiveItem(id)).filter((item): item is ArchiveContentViewItem => !!item),
);

export const $selectedItems = computed($selection, (selection) =>
    Array.from(selection)
        .map((id) => getArchiveItem(id))
        .filter((item): item is ArchiveContentViewItem => !!item),
);

export const $selectionCount = computed($selection, (selection) => selection.size);

export const $isNoneSelected = computed($selection, (selection) => selection.size === 0);

export const $isAllSelected = computed([$archiveTreeState, $selection], (state, selection) => {
    const loadedIds = getLoadedIds(state);
    if (loadedIds.length === 0 || selection.size === 0) {
        return false;
    }
    return loadedIds.every((id) => selection.has(id));
});

$archiveTreeState.subscribe((state) => {
    const validIds = new Set(state.nodes.keys());

    const currentSelection = $selection.get();
    if (currentSelection.size > 0) {
        let changed = false;
        const nextSelection = new Set<string>();
        currentSelection.forEach((id) => {
            if (validIds.has(id)) {
                nextSelection.add(id);
            } else {
                changed = true;
            }
        });
        if (changed) {
            $selection.set(nextSelection);
        }
    }

    const activeId = $activeId.get();
    if (activeId && !validIds.has(activeId)) {
        $activeId.set(null);
    }
});
