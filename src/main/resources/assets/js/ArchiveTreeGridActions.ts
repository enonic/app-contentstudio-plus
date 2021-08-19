import * as Q from 'q';
import {TreeGridActions} from 'lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ConfirmValueDialog} from 'lib-contentstudio/app/remove/ConfirmValueDialog';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {RestoreArchivedRequest} from './resource/RestoreArchivedRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ArchiveBundleViewItem} from './ArchiveBundleViewItem';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveDeleteDialog} from './ArchiveDeleteDialog';
import {ArchiveRestoreDialog} from './ArchiveRestoreDialog';

export class ArchiveTreeGridActions
    implements TreeGridActions<ArchiveViewItem> {

    private readonly restoreAction: Action;

    private readonly deleteAction: Action;

    private selectedItems: ArchiveViewItem[] = [];

    private confirmValueDialog?: ConfirmValueDialog;

    private confirmationDialog?: ConfirmationDialog;

    constructor() {
        this.restoreAction = this.createRestoreAction();
        this.deleteAction = this.createDeleteAction();
    }

    private createRestoreAction(): Action {
        const action: Action = new Action(i18n('action.restore')).setEnabled(false);

        action.onExecuted(() => {
            ArchiveRestoreDialog.getInstance().setArchiveBundle(<ArchiveBundleViewItem>this.selectedItems[0]).open();
        });

        return action;
    }

    private createDeleteAction(): Action {
        const action: Action = new Action(i18n('action.delete')).setEnabled(false);

        action.onExecuted(() => {
            ArchiveDeleteDialog.getInstance().setArchiveBundle(<ArchiveBundleViewItem>this.selectedItems[0]).open();
        });

        return action;
    }

    getAllActions(): Action[] {
        return [this.restoreAction, this.deleteAction];
    }

    updateActionsEnabledState(selectedItems: ArchiveViewItem[]): Q.Promise<void> {
        this.selectedItems = selectedItems;

        const state: boolean =
            selectedItems.length === 1 &&
            selectedItems.every((item: ArchiveViewItem) => ObjectHelper.iFrameSafeInstanceOf(item, ArchiveBundleViewItem));

        this.restoreAction.setEnabled(state);
        this.deleteAction.setEnabled(state);

        return Q(null);
    }

}
