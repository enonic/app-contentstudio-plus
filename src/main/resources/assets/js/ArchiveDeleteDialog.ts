import {ArchiveDialog} from './ArchiveDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DeleteContentRequest} from 'lib-contentstudio/app/resource/DeleteContentRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';

export class ArchiveDeleteDialog
    extends ArchiveDialog {

    private static INSTANCE: ArchiveDeleteDialog;

    constructor() {
        super({
            title: i18n('dialog.delete.archive.title'),
            class: 'archive-delete-dialog'
        });
    }

    protected getSubtitle(): string {
        return i18n('dialog.delete.archive.subtitle');
    }

    protected getItemsSubtitle(): string {
        return i18n('dialog.delete.archive.items.subtitle');
    }

    protected getArchiveActionTitle(): string {
        return i18n('dialog.deleteNow');
    }

    protected doAction() {
        const request: DeleteContentRequest = new DeleteContentRequest();
        request.setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH);

        this.items.forEach(item => request.addContentPath(item.getData().getPath()));

        request.sendAndParseWithPolling().catch(DefaultErrorHandler.handle);
    }

    protected getConfirmValueDialogTitle(): string {
        return i18n('dialog.confirmDelete');
    }

    protected getConfirmValueDialogSubTitle(): string {
        return i18n('dialog.confirmDelete.subtitle');
    }

    static getInstance(): ArchiveDeleteDialog {
        if (!ArchiveDeleteDialog.INSTANCE) {
            ArchiveDeleteDialog.INSTANCE = new ArchiveDeleteDialog();
        }

        return ArchiveDeleteDialog.INSTANCE;
    }

}
