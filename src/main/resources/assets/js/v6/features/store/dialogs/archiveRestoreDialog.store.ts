import {handleError} from '../../../../shared/errors';
import {notifyError, notifySuccess} from '../../../../shared/notifications';
import {i18n} from '../../../../shared/i18n';
import {computed, map} from 'nanostores';
import {type ArchivedContent, filterTopMost} from '../../shared/content/archivedContent';
import {fetchArchivedByIds, fetchArchivedDescendantIds, restoreArchived} from '../../api/archive';

type ArchiveRestoreDialogState = {
    open: boolean;
    items: ArchivedContent[];
    descendantIds: string[];
    descendants: ArchivedContent[];
    descendantWindow: number;
    loading: boolean;
    failed: boolean;
    submitting: boolean;
    taskId?: string;
    pendingTotal: number;
    pendingPrimaryName?: string;
};

const initialState: ArchiveRestoreDialogState = {
    open: false,
    items: [],
    descendantIds: [],
    descendants: [],
    descendantWindow: 0,
    loading: false,
    failed: false,
    submitting: false,
    taskId: undefined,
    pendingTotal: 0,
    pendingPrimaryName: undefined,
};

export const $archiveRestoreDialog = map<ArchiveRestoreDialogState>({...initialState});

export const $archiveRestoreTotal = computed($archiveRestoreDialog, (state) =>
    state.items.length + state.descendantIds.length,
);

export const $hasMoreArchiveRestoreDescendants = computed($archiveRestoreDialog, (state) =>
    state.descendantWindow < state.descendantIds.length,
);

const DESCENDANT_LOAD_SIZE = 36;

let instanceId = 0;

let loadingMore = false;

const orderByIds = (items: ArchivedContent[], orderIds: string[]): ArchivedContent[] => {
    const indexById = new Map<string, number>();
    orderIds.forEach((id, index) => indexById.set(id, index));
    const indexOf = (item: ArchivedContent): number => indexById.get(item.id) ?? orderIds.length;
    return [...items].sort((a, b) => indexOf(a) - indexOf(b));
};

export function openArchiveRestoreDialog(items: ArchivedContent[]): void {
    if (items.length === 0) {
        return;
    }
    instanceId += 1;
    $archiveRestoreDialog.set({...initialState, open: true, items});
    void loadDescendants(instanceId);
}

export function cancelArchiveRestoreDialog(): void {
    if ($archiveRestoreDialog.get().submitting) {
        return;
    }
    instanceId += 1;
    $archiveRestoreDialog.set({...initialState});
}

export async function executeArchiveRestoreDialog(): Promise<boolean> {
    const state = $archiveRestoreDialog.get();
    if (state.submitting || state.loading || state.failed || state.items.length === 0) {
        return false;
    }

    const total = state.items.length + state.descendantIds.length;
    const pendingPrimaryName = state.items[0]?.displayName || state.items[0]?.path;

    try {
        const ids = filterTopMost(state.items).map((item) => item.id);
        const taskId = await restoreArchived(ids);

        $archiveRestoreDialog.set({
            ...$archiveRestoreDialog.get(),
            submitting: true,
            taskId,
            pendingTotal: total,
            pendingPrimaryName,
        });
        return true;
    } catch (error) {
        handleError(error);
        notifyError(i18n('notify.restore.failed'));
        cancelArchiveRestoreDialog();
        return false;
    }
}

export function handleArchiveRestoreTaskComplete(success: boolean, message?: string): void {
    const state = $archiveRestoreDialog.get();
    if (!state.submitting) {
        return;
    }

    const total = state.pendingTotal || (state.items.length + state.descendantIds.length);
    const primaryName = state.pendingPrimaryName ?? '';

    if (success) {
        const successMessage = total > 1
            ? i18n('notify.restored.success.multiple', total)
            : i18n('notify.restored.success.single', primaryName);
        notifySuccess(successMessage);
    } else {
        notifyError(message || i18n('notify.restore.failed'));
    }

    instanceId += 1;
    $archiveRestoreDialog.set({...initialState});
}

async function loadDescendantWindow(allIds: string[], start: number, guardId: number): Promise<void> {
    const sliceIds = allIds.slice(start, start + DESCENDANT_LOAD_SIZE);
    const loaded = sliceIds.length > 0 ? await fetchArchivedByIds(sliceIds) : [];

    if (guardId !== instanceId) return;

    const {descendants, descendantIds} = $archiveRestoreDialog.get();
    const currentIds = new Set(descendantIds);
    const byId = new Map<string, ArchivedContent>();
    for (const item of [...(start === 0 ? [] : descendants), ...loaded]) {
        if (currentIds.has(item.id)) {
            byId.set(item.id, item);
        }
    }

    $archiveRestoreDialog.set({
        ...$archiveRestoreDialog.get(),
        descendants: orderByIds([...byId.values()], descendantIds),
        descendantWindow: Math.min(start + DESCENDANT_LOAD_SIZE, descendantIds.length),
    });
}

export async function loadMoreArchiveRestoreDescendants(): Promise<void> {
    if (loadingMore) return;

    const {descendantIds, descendantWindow} = $archiveRestoreDialog.get();
    if (descendantWindow >= descendantIds.length) return;

    loadingMore = true;
    const guardId = instanceId;
    try {
        await loadDescendantWindow(descendantIds, descendantWindow, guardId);
    } finally {
        loadingMore = false;
    }
}

async function loadDescendants(currentInstance: number): Promise<void> {
    $archiveRestoreDialog.setKey('loading', true);
    $archiveRestoreDialog.setKey('failed', false);

    try {
        const items = $archiveRestoreDialog.get().items;
        const descendantIds = await fetchArchivedDescendantIds(items.map((item) => item.path));

        if (currentInstance !== instanceId) return;

        const descendants = descendantIds.length > 0
            ? await fetchArchivedByIds(descendantIds.slice(0, DESCENDANT_LOAD_SIZE))
            : [];

        if (currentInstance !== instanceId) return;

        $archiveRestoreDialog.set({
            ...$archiveRestoreDialog.get(),
            descendantIds,
            descendants: orderByIds(descendants, descendantIds),
            descendantWindow: Math.min(DESCENDANT_LOAD_SIZE, descendantIds.length),
            loading: false,
            failed: false,
        });
    } catch (error) {
        if (currentInstance !== instanceId) return;
        $archiveRestoreDialog.set({...$archiveRestoreDialog.get(), loading: false, failed: true});
        handleError(error);
    }
}
