import {ArchiveDialog} from './ArchiveDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {NotifyManager} from 'lib-admin-ui/notify/NotifyManager';
import {ProgressBarManager} from 'lib-contentstudio/app/dialog/ProgressBarManager';
import {TaskId} from 'lib-admin-ui/task/TaskId';
import {TaskState} from 'lib-admin-ui/task/TaskState';

export class ArchiveRestoreDialog
    extends ArchiveDialog {

    private static INSTANCE: ArchiveRestoreDialog;

    private progressManager: ProgressBarManager;

    constructor() {
        super({
            title: i18n('dialog.restore.archive.title'),
            class: 'archive-restore-dialog'
        });
    }

    protected initElements(): void {
        super.initElements();

        this.progressManager = new ProgressBarManager({
            managingElement: <any>this,
            processingLabel: i18n('field.progress.restoring')
        });
    }

    protected initListeners(): void {
        super.initListeners();

        this.progressManager.onProgressComplete((task: TaskState) => {
            if (task === TaskState.FINISHED) {
                const successMessage: string =
                    this.totalToProcess > 1 ?
                    i18n('notify.restored.success.multiple', this.totalToProcess) :
                    i18n('notify.restored.success.single', this.items[0].getDisplayName());
                NotifyManager.get().showSuccess(successMessage);
            } else {
                NotifyManager.get().showError(i18n('notify.restore.failed'));
            }

        });

        this.progressManager.setSuppressNotifications(true);
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

    protected executeAction() {
        this.doAction();
    }

    protected doAction() {
        new RestoreArchivedRequest(this.items.map(item => item.getId())).sendAndParse().then((taskId: TaskId) => {
            this.progressManager.pollTask(taskId);
        }).catch(DefaultErrorHandler.handle);
    }

    protected getConfirmValueDialogTitle(): string {
        return i18n('dialog.confirmRestore.title');
    }

    protected getConfirmValueDialogSubTitle(): string {
        return i18n('dialog.confirmRestore.subtitle');
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.confirmValueDialog.addClass('confirm-restore');
            return rendered;
        });
    }

    static getInstance(): ArchiveRestoreDialog {
        if (!ArchiveRestoreDialog.INSTANCE) {
            ArchiveRestoreDialog.INSTANCE = new ArchiveRestoreDialog();
        }

        return ArchiveRestoreDialog.INSTANCE;
    }

}
