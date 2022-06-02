import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {EditContentEvent} from 'lib-contentstudio/app/event/EditContentEvent';
import {ActionButton} from '@enonic/lib-admin-ui/ui/button/ActionButton';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {LayerContent} from './LayerContent';

export class LayersContentActionButton extends ActionButton {

    private item: LayerContent;

    constructor(item: LayerContent) {
        super(new Action());

        this.item = item;

        this.getAction().setLabel(this.getLabelText());

        this.getAction().onExecuted(() => {
            new EditContentEvent([this.item.getItem()], this.item.getProject()).fire();
        });

        this.onClicked((event: MouseEvent) => {
            event.stopPropagation();
        });
    }

    private getLabelText(): string {
        const isCurrentProject: boolean = this.item.getProject().getName() === ProjectContext.get().getProject().getName();
        const isInherited: boolean = this.item.getItem().isDataInherited();
        const isReadOnly: boolean = this.item.getItem().isReadOnly();

        if (!isReadOnly && isCurrentProject) {
            return isInherited ? i18n('action.translate') : i18n('action.edit');
        }

        return i18n('action.open');
    }
}
