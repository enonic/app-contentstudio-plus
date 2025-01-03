import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DeleteContentRequest} from 'lib-contentstudio/app/resource/DeleteContentRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveProgressDialog} from './ArchiveProgressDialog';
import {TaskId} from '@enonic/lib-admin-ui/task/TaskId';

export class ArchiveDeleteDialog
    extends ArchiveProgressDialog {

    private static INSTANCE: ArchiveDeleteDialog;

    constructor() {
        super({
            title: i18n('dialog.delete.archive.title'),
            class: 'archive-delete-dialog',
        });
    }

    static getInstance(): ArchiveDeleteDialog {
        if (!ArchiveDeleteDialog.INSTANCE) {
            ArchiveDeleteDialog.INSTANCE = new ArchiveDeleteDialog();
        }

        return ArchiveDeleteDialog.INSTANCE;
    }

    protected getSubtitle(): string {
        return i18n('dialog.delete.archive.subtitle');
    }

    protected getItemsSubtitle(): string {
        return i18n('dialog.delete.archive.items.subtitle');
    }

    protected getArchiveActionTitle(): string {
        return i18n('dialog.delete');
    }

    protected doAction(): void {
        const request: DeleteContentRequest = new DeleteContentRequest();
        request.setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH);

        this.items.forEach(item => request.addContentPath(item.getPath()));

        request.sendAndParse().then((taskId: TaskId) => {
            this.progressManager.pollTask(taskId);
        }).catch(DefaultErrorHandler.handle);
    }

    protected getConfirmValueDialogTitle(): string {
        return i18n('dialog.confirmDelete');
    }

    protected getConfirmValueDialogSubTitle(): string {
        return i18n('dialog.confirmDelete.subtitle');
    }

    protected getProcessingLabelText(): string {
        return i18n('field.progress.deleting');
    }

    protected getSuccessTextForMultiple(): string {
        return i18n('notify.deleted.success.multiple', this.totalToProcess);
    }

    protected getSuccessTextForSingle(): string {
        return i18n('notify.deleted.success.single', this.items[0].getDisplayName());
    }

    protected getFailText(): string {
        return i18n('notify.delete.failed');
    }

}
