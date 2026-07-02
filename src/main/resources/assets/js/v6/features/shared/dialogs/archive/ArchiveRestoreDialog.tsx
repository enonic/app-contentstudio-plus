import {useI18n} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useI18n';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/shared/ui/LegacyElement';
import {useStore} from '@nanostores/preact';
import {type ReactElement} from 'react';
import {
    $archiveRestoreDialog,
    $archiveRestoreTotal,
    $hasMoreArchiveRestoreDescendants,
    cancelArchiveRestoreDialog,
    executeArchiveRestoreDialog,
    handleArchiveRestoreTaskComplete,
    loadMoreArchiveRestoreDescendants,
} from '../../../store/dialogs/archiveRestoreDialog.store';
import {ArchiveDialogShell} from './ArchiveDialogShell';

const ARCHIVE_RESTORE_DIALOG_NAME = 'ArchiveRestoreDialog';

export const ArchiveRestoreDialog = (): ReactElement => {
    const {open, items, descendants, loading, failed, submitting, taskId} = useStore($archiveRestoreDialog, {
        keys: ['open', 'items', 'descendants', 'loading', 'failed', 'submitting', 'taskId'],
    });
    const total = useStore($archiveRestoreTotal);
    const hasMoreDescendants = useStore($hasMoreArchiveRestoreDescendants);
    const title = useI18n('dialog.restore.archive.title');
    const description = useI18n('dialog.restore.archive.subtitle');
    const dependantsLabel = useI18n('dialog.restore.archive.items.subtitle');
    const actionLabel = useI18n('action.restore');
    const confirmTitle = useI18n('dialog.confirmRestore.title');
    const confirmDescription = useI18n('dialog.confirmRestore.subtitle');
    const progressTitle = useI18n('field.progress.restoring');

    const ready = open && !loading && !submitting && items.length > 0;
    const actionButtonLabel = total > 1 ? `${actionLabel} (${total})` : actionLabel;

    return (
        <ArchiveDialogShell
            data-component={ARCHIVE_RESTORE_DIALOG_NAME}
            open={open}
            items={items}
            descendants={descendants}
            total={total}
            taskId={taskId}
            ready={ready}
            loading={loading}
            failed={failed}
            hasMore={hasMoreDescendants}
            onLoadMoreDescendants={loadMoreArchiveRestoreDescendants}
            progressDescriptionKey="dialog.restoring"
            onCancel={cancelArchiveRestoreDialog}
            onExecute={executeArchiveRestoreDialog}
            onTaskComplete={handleArchiveRestoreTaskComplete}
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

ArchiveRestoreDialog.displayName = ARCHIVE_RESTORE_DIALOG_NAME;

export class ArchiveRestoreDialogElement extends LegacyElement<typeof ArchiveRestoreDialog, Record<string, never>> {
    constructor() {
        super({}, ArchiveRestoreDialog);
    }
}
