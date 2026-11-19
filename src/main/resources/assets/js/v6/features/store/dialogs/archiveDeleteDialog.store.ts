import {handleError} from '../../../../shared/errors';
import {notifyError, notifySuccess} from '../../../../shared/notifications';
import {i18n} from '../../../../shared/i18n';
import type {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {computed, map} from 'nanostores';
import {ArchiveContentViewItem} from '../../../../ArchiveContentViewItem';
import {deleteArchived, fetchArchivedByIds, fetchArchivedDescendantIds} from '../../api/archive';

type ArchiveDeleteDialogState = {
    open: boolean;
    items: ArchiveContentViewItem[];
    descendantIds: string[];
    descendants: ContentSummary[];
    descendantWindow: number;
    loading: boolean;
    failed: boolean;
    submitting: boolean;
    taskId?: string;
    pendingTotal: number;
    pendingPrimaryName?: string;
};

const initialState: ArchiveDeleteDialogState = {
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

export const $archiveDeleteDialog = map<ArchiveDeleteDialogState>({...initialState});

export const $archiveDeleteTotal = computed($archiveDeleteDialog, (state) =>
    state.items.length + state.descendantIds.length,
);

export const $hasMoreArchiveDeleteDescendants = computed($archiveDeleteDialog, (state) =>
    state.descendantWindow < state.descendantIds.length,
);

const DESCENDANT_LOAD_SIZE = 36;

let instanceId = 0;

let loadingMore = false;

const orderSummariesByIds = (summaries: ContentSummary[], orderIds: string[]): ContentSummary[] => {
    const indexById = new Map<string, number>();
    orderIds.forEach((id, index) => indexById.set(id, index));
    const indexOf = (item: ContentSummary): number =>
        indexById.get(item.getContentId().toString()) ?? orderIds.length;
    return [...summaries].sort((a, b) => indexOf(a) - indexOf(b));
};

export function openArchiveDeleteDialog(items: ArchiveContentViewItem[]): void {
    if (items.length === 0) {
        return;
    }
    instanceId += 1;
    $archiveDeleteDialog.set({...initialState, open: true, items});
    void loadDescendants(instanceId);
}

export function cancelArchiveDeleteDialog(): void {
    if ($archiveDeleteDialog.get().submitting) {
        return;
    }
    instanceId += 1;
    $archiveDeleteDialog.set({...initialState});
}

export async function executeArchiveDeleteDialog(): Promise<boolean> {
    const state = $archiveDeleteDialog.get();
    if (state.submitting || state.loading || state.failed || state.items.length === 0) {
        return false;
    }

    const total = state.items.length + state.descendantIds.length;
    const pendingPrimaryName = state.items[0]?.getDisplayName() || state.items[0]?.getPath()?.toString();

    try {
        const taskId = await deleteArchived(state.items.map((item) => item.getPath().toString()));

        $archiveDeleteDialog.set({
            ...$archiveDeleteDialog.get(),
            submitting: true,
            taskId,
            pendingTotal: total,
            pendingPrimaryName,
        });
        return true;
    } catch (error) {
        handleError(error);
        notifyError(i18n('notify.delete.failed'));
        cancelArchiveDeleteDialog();
        return false;
    }
}

export function handleArchiveDeleteTaskComplete(success: boolean, message?: string): void {
    const state = $archiveDeleteDialog.get();
    if (!state.submitting) {
        return;
    }

    const total = state.pendingTotal || (state.items.length + state.descendantIds.length);
    const primaryName = state.pendingPrimaryName ?? '';

    if (success) {
        const successMessage = total > 1
            ? i18n('notify.deleted.success.multiple', total)
            : i18n('notify.deleted.success.single', primaryName);
        notifySuccess(successMessage);
    } else {
        notifyError(message || i18n('notify.delete.failed'));
    }

    instanceId += 1;
    $archiveDeleteDialog.set({...initialState});
}

async function loadDescendantWindow(allIds: string[], start: number, guardId: number): Promise<void> {
    const sliceIds = allIds.slice(start, start + DESCENDANT_LOAD_SIZE);
    const summaries = sliceIds.length > 0 ? await fetchArchivedByIds(sliceIds) : [];

    if (guardId !== instanceId) return;

    const {descendants, descendantIds} = $archiveDeleteDialog.get();
    const currentIds = new Set(descendantIds);
    const byId = new Map<string, ContentSummary>();
    for (const item of [...(start === 0 ? [] : descendants), ...summaries]) {
        const key = item.getContentId().toString();
        if (currentIds.has(key)) {
            byId.set(key, item);
        }
    }

    $archiveDeleteDialog.set({
        ...$archiveDeleteDialog.get(),
        descendants: orderSummariesByIds([...byId.values()], descendantIds),
        descendantWindow: Math.min(start + DESCENDANT_LOAD_SIZE, descendantIds.length),
    });
}

export async function loadMoreArchiveDeleteDescendants(): Promise<void> {
    if (loadingMore) return;

    const {descendantIds, descendantWindow} = $archiveDeleteDialog.get();
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
    $archiveDeleteDialog.setKey('loading', true);
    $archiveDeleteDialog.setKey('failed', false);

    try {
        const items = $archiveDeleteDialog.get().items;
        const descendantIds = await fetchArchivedDescendantIds(items.map((item) => item.getPath().toString()));

        if (currentInstance !== instanceId) return;

        const descendants = descendantIds.length > 0
            ? await fetchArchivedByIds(descendantIds.slice(0, DESCENDANT_LOAD_SIZE))
            : [];

        if (currentInstance !== instanceId) return;

        $archiveDeleteDialog.set({
            ...$archiveDeleteDialog.get(),
            descendantIds,
            descendants: orderSummariesByIds(descendants, descendantIds),
            descendantWindow: Math.min(DESCENDANT_LOAD_SIZE, descendantIds.length),
            loading: false,
            failed: false,
        });
    } catch (error) {
        if (currentInstance !== instanceId) return;
        $archiveDeleteDialog.set({...$archiveDeleteDialog.get(), loading: false, failed: true});
        handleError(error);
    }
}
