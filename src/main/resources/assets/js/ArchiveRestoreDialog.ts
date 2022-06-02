import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {TaskId} from '@enonic/lib-admin-ui/task/TaskId';
import {ArchiveProgressDialog} from './ArchiveProgressDialog';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ArchiveHelper} from './ArchiveHelper';

export class ArchiveRestoreDialog
    extends ArchiveProgressDialog {

    private static INSTANCE: ArchiveRestoreDialog;

    constructor() {
        super({
            title: i18n('dialog.restore.archive.title'),
            class: 'archive-restore-dialog',
        });
    }

    static getInstance(): ArchiveRestoreDialog {
        if (!ArchiveRestoreDialog.INSTANCE) {
            ArchiveRestoreDialog.INSTANCE = new ArchiveRestoreDialog();
        }

        return ArchiveRestoreDialog.INSTANCE;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.confirmValueDialog.addClass('confirm-restore');
            return rendered;
        });
    }

    protected getProcessingLabelText(): string {
        return i18n('field.progress.restoring');
    }

    protected getSuccessTextForMultiple(): string {
        return i18n('notify.restored.success.multiple', this.totalToProcess);
    }

    protected getSuccessTextForSingle(): string {
        return i18n('notify.restored.success.single', this.items[0].getDisplayName());
    }

    protected getFailText(): string {
        return i18n('notify.restore.failed');
    }

    protected getSubtitle(): string {
        return i18n('dialog.restore.archive.subtitle');
    }

    protected getItemsSubtitle(): string {
        return i18n('dialog.restore.archive.items.subtitle');
    }

    protected getArchiveActionTitle(): string {
        return i18n('action.restore');
    }

    protected doAction(): void {
        new RestoreArchivedRequest(this.getItemsToRestore()).sendAndParse().then((taskId: TaskId) => {
            this.progressManager.pollTask(taskId);
        }).catch(DefaultErrorHandler.handle);
    }

    protected getConfirmValueDialogTitle(): string {
        return i18n('dialog.confirmRestore.title');
    }

    protected getConfirmValueDialogSubTitle(): string {
        return i18n('dialog.confirmRestore.subtitle');
    }

    private getItemsToRestore(): string[] {
        return (<ArchiveViewItem[]>ArchiveHelper.filterTopMostItems(this.items)).map((item: ArchiveViewItem) => item.getId());
    }

}
