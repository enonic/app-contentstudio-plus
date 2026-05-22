import Q from 'q';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {openArchiveDeleteDialog} from './v6/features/store/dialogs/archiveDeleteDialog.store';
import {openArchiveRestoreDialog} from './v6/features/store/dialogs/archiveRestoreDialog.store';

export class ArchiveTreeGridActions
    implements TreeGridActions<ArchiveContentViewItem> {

    private readonly restoreAction: Action;

    private readonly deleteAction: Action;

    private selectedItems: ArchiveContentViewItem[] = [];

    constructor() {
        this.restoreAction = this.createRestoreAction();
        this.deleteAction = this.createDeleteAction();
    }

    getAllActions(): Action[] {
        return [this.restoreAction, this.deleteAction];
    }

    updateActionsEnabledState(selectedItems: ArchiveContentViewItem[]): Q.Promise<void> {
        this.selectedItems = selectedItems;

        const state: boolean = selectedItems.length > 0;

        this.restoreAction.setEnabled(state);
        this.deleteAction.setEnabled(state);

        return Q();
    }

    private createRestoreAction(): Action {
        const action: Action = new Action(i18n('action.restore')).setEnabled(false);

        action.onExecuted(() => {
            openArchiveRestoreDialog(this.selectedItems);
        });

        return action;
    }

    private createDeleteAction(): Action {
        const action: Action = new Action(i18n('action.delete')).setEnabled(false);

        action.onExecuted(() => {
            openArchiveDeleteDialog(this.selectedItems);
        });

        return action;
    }
}
