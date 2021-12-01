import {i18n} from 'lib-admin-ui/util/Messages';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {TaskId} from 'lib-admin-ui/task/TaskId';
import {ArchiveProgressDialog} from './ArchiveProgressDialog';
import {ArchiveViewItem} from './ArchiveViewItem';

export class ArchiveRestoreDialog
    extends ArchiveProgressDialog {

    private static INSTANCE: ArchiveRestoreDialog;

    constructor() {
        super({
            title: i18n('dialog.restore.archive.title'),
            class: 'archive-restore-dialog'
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

    protected doAction() {
        new RestoreArchivedRequest(this.getItemsToRestore()).sendAndParse().then((taskId: TaskId) => {
            this.progressManager.pollTask(taskId);
        }).catch(DefaultErrorHandler.handle);
    }

    private getItemsToRestore(): string[] {
        const itemsToDelete: ArchiveViewItem[] = [];

        this.items.forEach((item: ArchiveViewItem) => {
            const contains: boolean = itemsToDelete.some((itemToDelete: ArchiveViewItem, index: number) => {
                if (item.getData().getPath().isDescendantOf(itemToDelete.getData().getPath())) {
                    return true;
                }

                if (itemToDelete.getData().getPath().isDescendantOf(item.getData().getPath())) {
                    itemsToDelete[index] = item;
                    return true;
                }

                return false;
            });

            if (!contains) {
                itemsToDelete.push(item);
            }
        });

        return itemsToDelete.map((item) => item.getId());
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
