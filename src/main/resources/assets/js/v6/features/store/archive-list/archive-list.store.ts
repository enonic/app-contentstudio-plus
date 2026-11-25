import {atom, computed, map} from 'nanostores';
import type {ArchivedContent} from '../../shared/content/archivedContent';
import {createTree, flattenTree, type TreeState} from '../../shared/lib/tree';
import type {ArchiveListRoot} from './archive-list.types';

export const $archiveTreeState = atom<TreeState<ArchivedContent>>(createTree<ArchivedContent>());

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
            .filter((item): item is ArchivedContent => !!item),
        total: root.total,
        loading,
    }),
);

export const $hasMoreArchiveItems = computed($archiveListRoot, (root) => root.hasMore);

export function getArchiveItem(id: string): ArchivedContent | undefined {
    return $archiveTreeState.get().nodes.get(id)?.data;
}
