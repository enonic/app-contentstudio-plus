import * as Q from 'q';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ArchiveDeleteDialog} from './ArchiveDeleteDialog';
import {ArchiveRestoreDialog} from './ArchiveRestoreDialog';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';

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
        const action: Action = new Action(i18n('action.restoreMore')).setEnabled(false);

        action.onExecuted(() => {
            ArchiveRestoreDialog.getInstance().setItems(this.selectedItems).open();
        });

        return action;
    }

    private createDeleteAction(): Action {
        const action: Action = new Action(i18n('action.deleteMore')).setEnabled(false);

        action.onExecuted(() => {
            ArchiveDeleteDialog.getInstance().setItems(this.selectedItems).open();
        });

        return action;
    }
}
