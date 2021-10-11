import {ArchiveDialog} from './ArchiveDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {NotifyManager} from 'lib-admin-ui/notify/NotifyManager';

export class ArchiveRestoreDialog
    extends ArchiveDialog {

    private static INSTANCE: ArchiveRestoreDialog;

    constructor() {
        super({
            title: i18n('dialog.restore.archive.title'),
            class: 'archive-restore-dialog'
        });
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
        new RestoreArchivedRequest(this.items.map(item => item.getId()))
            .sendAndParseWithPolling()
            .then(() => {
                const successMessage: string =
                    this.totalToProcess > 1 ?
                    i18n('notify.restored.success.multiple', this.totalToProcess) :
                    i18n('notify.restored.success.single', this.items[0].getDisplayName() );
                NotifyManager.get().showSuccess(successMessage);
            })
            .catch(DefaultErrorHandler.handle);
    }

    protected getConfirmValueDialogTitle(): string {
        return i18n('dialog.confirmRestore.title');
    }

    protected getConfirmValueDialogSubTitle(): string {
        return i18n('dialog.confirmRestore.subtitle');
    }

    protected isConfirmDialogRequired(): boolean {
        return this.items.length + this.itemsList.getItemCount() > 1;
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
