import {createEmptyState, flattenTree, type TreeState} from '@enonic/lib-contentstudio/v6/shared/lib/tree-store';
import {atom, computed, map} from 'nanostores';
import {ArchiveContentViewItem} from '../../../../ArchiveContentViewItem';
import type {ArchiveListRoot} from './archive-list.types';

export const $archiveTreeState = atom<TreeState<ArchiveContentViewItem>>(
    createEmptyState<ArchiveContentViewItem>(),
);

export const $archiveListLoading = atom<boolean>(false);

export const $archiveListRoot = map<ArchiveListRoot>({
    total: 0,
    hasMore: false,
});

export const $archiveFlatNodes = computed($archiveTreeState, flattenTree);

export const $archiveListState = computed(
    [$archiveTreeState, $archiveListRoot, $archiveListLoading],
    (state, root, loading) => ({
        items: state.rootIds
            .map((id) => state.nodes.get(id)?.data)
            .filter((item): item is ArchiveContentViewItem => !!item),
        total: root.total,
        loading,
    }),
);

export const $hasMoreArchiveItems = computed($archiveListRoot, (root) => root.hasMore);

export function getArchiveItem(id: string): ArchiveContentViewItem | undefined {
    return $archiveTreeState.get().nodes.get(id)?.data ?? undefined;
}
