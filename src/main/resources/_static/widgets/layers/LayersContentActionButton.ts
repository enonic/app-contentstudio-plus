import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {EditContentEvent} from 'lib-contentstudio/app/event/EditContentEvent';
import {ActionButton} from '@enonic/lib-admin-ui/ui/button/ActionButton';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {LayerContent} from './LayerContent';
import {ContentsLocalizer} from 'lib-contentstudio/app/browse/action/ContentsLocalizer';
import {ContentEventsProcessor} from 'lib-contentstudio/app/ContentEventsProcessor';
import {AppHelper} from '../../util/AppHelper';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';

enum Mode {
    EDIT,
    LOCALIZE,
    READONLY
}

export class LayersContentActionButton extends ActionButton {

    private item: LayerContent;

    private readonly mode: Mode;

    constructor(item: LayerContent) {
        super(new Action());

        this.item = item;

        this.mode = this.getMode();
        this.getAction().setLabel(this.getLabelText());

        this.getAction().onExecuted(() => {
            if (this.mode === Mode.LOCALIZE) {
                this.localize();
            } else {
                this.edit();
            }
        });

        this.onClicked((event: MouseEvent) => {
            event.stopPropagation();
        });
    }

    private getMode(): Mode {
        const isCurrentProject: boolean = this.item.getProject().getName() === ProjectContext.get().getProject().getName();

        if (this.item.getItem().isReadOnly() || !isCurrentProject) {
            return Mode.READONLY;
        }

        const isToLocalize: boolean = this.item.getItem().isDataInherited() && !!this.item.getProject().getLanguage();

        return isToLocalize ? Mode.LOCALIZE : Mode.EDIT;
    }

    private getLabelText(): string {
        if (this.mode === Mode.LOCALIZE){
            return i18n('action.translate');
        }

        if (this.mode === Mode.EDIT) {
            return i18n('action.edit');
        }

        return i18n('action.open');
    }

    private localize(): void {
        new ContentsLocalizer().localizeAndEdit([this.item.getItem()]).catch(DefaultErrorHandler.handle);
    }

    private edit(): void {
        ContentEventsProcessor.handleEdit(
          new EditContentEvent([this.item.getItem()], this.item.getProject()));
    }
}
