import {useI18n} from '@enonic/lib-contentstudio/v6/features/hooks/useI18n';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import {useStore} from '@nanostores/preact';
import {type ReactElement} from 'react';
import {
    $archiveDeleteDialog,
    $archiveDeleteTotal,
    cancelArchiveDeleteDialog,
    executeArchiveDeleteDialog,
    handleArchiveDeleteTaskComplete,
} from '../../../store/dialogs/archiveDeleteDialog.store';
import {ArchiveDialogShell} from './ArchiveDialogShell';

const ARCHIVE_DELETE_DIALOG_NAME = 'ArchiveDeleteDialog';

export const ArchiveDeleteDialog = (): ReactElement => {
    const {open, items, descendants, loading, submitting, taskId} = useStore($archiveDeleteDialog, {
        keys: ['open', 'items', 'descendants', 'loading', 'submitting', 'taskId'],
    });
    const total = useStore($archiveDeleteTotal);
    const title = useI18n('dialog.delete.archive.title');
    const description = useI18n('dialog.delete.archive.subtitle');
    const dependantsLabel = useI18n('dialog.delete.archive.items.subtitle');
    const actionLabel = useI18n('action.delete');
    const confirmTitle = useI18n('dialog.confirmDelete');
    const confirmDescription = useI18n('dialog.confirmDelete.subtitle');
    const progressTitle = useI18n('field.progress.deleting');

    const ready = open && !loading && !submitting && items.length > 0;
    const actionButtonLabel = total > 1 ? `${actionLabel} (${total})` : actionLabel;

    return (
        <ArchiveDialogShell
            data-component={ARCHIVE_DELETE_DIALOG_NAME}
            open={open}
            items={items}
            descendants={descendants}
            total={total}
            taskId={taskId}
            ready={ready}
            onCancel={cancelArchiveDeleteDialog}
            onExecute={executeArchiveDeleteDialog}
            onTaskComplete={handleArchiveDeleteTaskComplete}
            title={title}
            description={description}
            dependantsLabel={dependantsLabel}
            actionButtonLabel={actionButtonLabel}
            confirmTitle={confirmTitle}
            confirmDescription={confirmDescription}
            progressTitle={progressTitle}
        />
    );
};

ArchiveDeleteDialog.displayName = ARCHIVE_DELETE_DIALOG_NAME;

export class ArchiveDeleteDialogElement extends LegacyElement<typeof ArchiveDeleteDialog, Record<string, never>> {
    constructor() {
        super({}, ArchiveDeleteDialog);
    }
}
