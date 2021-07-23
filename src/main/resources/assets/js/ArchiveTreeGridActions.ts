import * as Q from 'q';
import {TreeGridActions} from 'lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';
import { ConfirmValueDialog } from 'lib-contentstudio/app/remove/ConfirmValueDialog';
import { ConfirmationDialog } from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import { ContentId } from 'lib-contentstudio/app/content/ContentId';
import { DefaultErrorHandler } from 'lib-admin-ui/DefaultErrorHandler';

export class ArchiveTreeGridActions implements TreeGridActions<ContentSummaryAndCompareStatus> {

    private restoreAction: Action;

    private deleteAction: Action;

    private selectedItems: ContentSummaryAndCompareStatus[] = [];

    private confirmValueDialog?: ConfirmValueDialog;

    private confirmationDialog?: ConfirmationDialog;

    constructor() {
        this.restoreAction = this.createRestoreAction();
        this.deleteAction = this.createDeleteAction();
    }

    private createRestoreAction(): Action {
        const action: Action = new Action(i18n('action.restore')).setEnabled(false);

        action.onExecuted(() => {
            if (this.selectedItems.length > 1) {
                this.getConfirmRestoreValueDialog().open();
            } else {
                this.getConfirmRestoreDialog().open();
            }
        });

        return action;
    }

    private createDeleteAction(): Action {
        const action: Action = new Action(i18n('action.delete')).setEnabled(false);

        action.onExecuted(() => {
            if (this.selectedItems.length > 1) {
                this.getConfirmDeleteValueDialog().open();
            } else {
                this.getConfirmDeleteDialog().open();
            }
        });

        return action;
    }

    private getConfirmDeleteValueDialog(): ConfirmValueDialog {
        return this.getConfirmValueDialog()
            .setHeaderText(i18n('dialog.confirmDelete'))
            .setSubheaderText(i18n('dialog.confirmDelete.subname'))
            .setValueToCheck('' + this.selectedItems.length)
            .setYesCallback(this.deleteSelectedItems.bind(this))
    }

    private getConfirmRestoreValueDialog(): ConfirmValueDialog {
        return this.getConfirmValueDialog()
            .setHeaderText(i18n('dialog.confirmRestore'))
            .setSubheaderText(i18n('dialog.confirmRestore.subname'))
            .setValueToCheck('' + this.selectedItems.length)
            .setYesCallback(this.restoreSelectedItems.bind(this))
    }

    private deleteSelectedItems() {

    }

    private restoreSelectedItems() {
        const ids: ContentId[] = this.selectedItems.map((item: ContentSummaryAndCompareStatus) => item.getContentId());
        new RestoreArchivedRequest(ids).sendAndParse().catch(DefaultErrorHandler.handle)
    }

    private getConfirmValueDialog(): ConfirmValueDialog {
        if (!this.confirmValueDialog) {
            this.confirmValueDialog = new ConfirmValueDialog();
        }

        return this.confirmValueDialog;
    }

    private getConfirmDeleteDialog(): ConfirmationDialog {
        return this.getConfirmationDialog()
            .setQuestion(i18n('dialog.confirmDelete'))
            .setYesCallback(this.deleteSelectedItems.bind(this))
    }

    private getConfirmRestoreDialog(): ConfirmationDialog {
        return this.getConfirmationDialog()
            .setQuestion(i18n('dialog.confirmRestore.subname'))
            .setYesCallback(this.restoreSelectedItems.bind(this))
    }

    private getConfirmationDialog(): ConfirmationDialog {
        if (!this.confirmationDialog) {
            this.confirmationDialog = new ConfirmationDialog();
        }

        return this.confirmationDialog;
    }

    getAllActions(): Action[] {
        return [this.restoreAction, this.deleteAction];
    }

    updateActionsEnabledState(selectedItems: ContentSummaryAndCompareStatus[]): Q.Promise<void> {
        this.selectedItems = selectedItems;

        if (selectedItems.length === 0) {
            this.restoreAction.setEnabled(false);
            this.deleteAction.setEnabled(false);
            return Q(null);
        }

        this.restoreAction.setEnabled(true);
        this.deleteAction.setEnabled(true);

        return Q(null);
    }

}