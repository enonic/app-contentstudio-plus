import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import type {TaskId} from '@enonic/lib-admin-ui/task/TaskId';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
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
    descendants: ContentSummary[];
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
    descendants: [],
    loading: false,
    failed: false,
    submitting: false,
    taskId: undefined,
    pendingTotal: 0,
    pendingPrimaryName: undefined,
};

export const $archiveDeleteDialog = map<ArchiveDeleteDialogState>({...initialState});

export const $archiveDeleteTotal = computed($archiveDeleteDialog, (state) =>
    state.items.length + state.descendants.length,
);

const fetcher = new ArchiveContentFetcher();

let instanceId = 0;

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

    const total = state.items.length + state.descendants.length;
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

    const total = state.pendingTotal || (state.items.length + state.descendants.length);
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

async function loadDescendants(currentInstance: number): Promise<void> {
    $archiveDeleteDialog.setKey('loading', true);
    $archiveDeleteDialog.setKey('failed', false);

    try {
        const items = $archiveDeleteDialog.get().items;
        const ids = await new GetDescendantsOfContentsRequest()
            .setContentPaths(items.map((item) => item.getContentSummary().getPath()))
            .setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH)
            .sendAndParse();

        if (currentInstance !== instanceId) return;

        const descendants = ids.length > 0 ? await fetcher.fetchByIds(ids) : [];

        if (currentInstance !== instanceId) return;

        $archiveDeleteDialog.set({
            ...$archiveDeleteDialog.get(),
            descendants,
            loading: false,
            failed: false,
        });
    } catch (error) {
        if (currentInstance !== instanceId) return;
        $archiveDeleteDialog.set({...$archiveDeleteDialog.get(), loading: false, failed: true});
        DefaultErrorHandler.handle(error);
    }
}
