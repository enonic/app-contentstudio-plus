import {computed} from 'nanostores';
import {$currentItems} from '../archive-selection';
import {openArchiveDeleteDialog} from '../dialogs/archiveDeleteDialog.store';
import {openArchiveRestoreDialog} from '../dialogs/archiveRestoreDialog.store';

export type ArchiveActionId = 'restore' | 'delete';

export type ArchiveAction = {
    id: ArchiveActionId;
    labelKey: string;
};

export const ARCHIVE_ACTIONS: readonly ArchiveAction[] = [
    {id: 'restore', labelKey: 'action.restore'},
    {id: 'delete', labelKey: 'action.delete'},
];

export const $archiveActionsEnabled = computed($currentItems, (items) => items.length > 0);

export function executeArchiveAction(id: ArchiveActionId): void {
    const items = [...$currentItems.get()];
    if (items.length === 0) {
        return;
    }

    if (id === 'restore') {
        openArchiveRestoreDialog(items);
    } else {
        openArchiveDeleteDialog(items);
    }
}
