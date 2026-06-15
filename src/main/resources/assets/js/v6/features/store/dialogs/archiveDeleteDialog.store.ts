import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import type {TaskId} from '@enonic/lib-admin-ui/task/TaskId';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import type {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import type {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {DeleteContentRequest} from '@enonic/lib-contentstudio/app/resource/DeleteContentRequest';
import {GetDescendantsOfContentsRequest} from '@enonic/lib-contentstudio/app/resource/GetDescendantsOfContentsRequest';
import {computed, map} from 'nanostores';
import {ArchiveContentFetcher} from '../../../../ArchiveContentFetcher';
import {ArchiveContentViewItem} from '../../../../ArchiveContentViewItem';
import {ArchiveResourceRequest} from '../../../../resource/ArchiveResourceRequest';

type ArchiveDeleteDialogState = {
    open: boolean;
    items: ArchiveContentViewItem[];
    descendantIds: ContentId[];
    descendants: ContentSummary[];
    descendantWindow: number;
    loading: boolean;
    failed: boolean;
    submitting: boolean;
    taskId?: TaskId;
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

const fetcher = new ArchiveContentFetcher();

const DESCENDANT_LOAD_SIZE = 36;

let instanceId = 0;

let loadingMore = false;

const orderSummariesByIds = (summaries: ContentSummary[], orderIds: ContentId[]): ContentSummary[] => {
    const indexById = new Map<string, number>();
    orderIds.forEach((id, index) => indexById.set(id.toString(), index));
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
        const request = new DeleteContentRequest();
        request.setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH);
        state.items.forEach((item) => request.addContentPath(item.getPath()));
        const taskId = await request.sendAndParse();

        $archiveDeleteDialog.set({
            ...$archiveDeleteDialog.get(),
            submitting: true,
            taskId,
            pendingTotal: total,
            pendingPrimaryName,
        });
        return true;
    } catch (error) {
        DefaultErrorHandler.handle(error);
        NotifyManager.get().showError(i18n('notify.delete.failed'));
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
        NotifyManager.get().showSuccess(successMessage);
    } else {
        NotifyManager.get().showError(message || i18n('notify.delete.failed'));
    }

    instanceId += 1;
    $archiveDeleteDialog.set({...initialState});
}

async function loadDescendantWindow(allIds: ContentId[], start: number, guardId: number): Promise<void> {
    const sliceIds = allIds.slice(start, start + DESCENDANT_LOAD_SIZE);
    const summaries = sliceIds.length > 0 ? await fetcher.fetchByIds(sliceIds) : [];

    if (guardId !== instanceId) return;

    const {descendants, descendantIds} = $archiveDeleteDialog.get();
    const currentIds = new Set(descendantIds.map((id) => id.toString()));
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
        const descendantIds = await new GetDescendantsOfContentsRequest()
            .setContentPaths(items.map((item) => item.getContentSummary().getPath()))
            .setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH)
            .sendAndParse();

        if (currentInstance !== instanceId) return;

        const descendants = descendantIds.length > 0
            ? await fetcher.fetchByIds(descendantIds.slice(0, DESCENDANT_LOAD_SIZE))
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
        DefaultErrorHandler.handle(error);
    }
}
