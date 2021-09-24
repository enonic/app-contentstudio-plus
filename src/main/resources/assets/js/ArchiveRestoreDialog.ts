import {ArchiveDialog} from './ArchiveDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ArchiveTreeGridRefreshRequiredEvent} from './ArchiveTreeGridRefreshRequiredEvent';
import {ContentTreeGridRefreshRequiredEvent} from 'lib-contentstudio/app/browse/ContentTreeGridRefreshRequiredEvent';

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
                new ArchiveTreeGridRefreshRequiredEvent().fire();
                new ContentTreeGridRefreshRequiredEvent().fire();
            })
            .catch(DefaultErrorHandler.handle);
    }

    protected getConfirmValueDialogTitle(): string {
        return i18n('dialog.confirmRestore.title');
    }

    protected getConfirmValueDialogSubTitle(): string {
        return i18n('dialog.confirmRestore.subtitle');
    }

    static getInstance(): ArchiveRestoreDialog {
        if (!ArchiveRestoreDialog.INSTANCE) {
            ArchiveRestoreDialog.INSTANCE = new ArchiveRestoreDialog();
        }

        return ArchiveRestoreDialog.INSTANCE;
    }

}
