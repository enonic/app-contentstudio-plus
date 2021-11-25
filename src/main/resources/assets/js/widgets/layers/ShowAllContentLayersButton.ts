import {ActionButton} from 'lib-admin-ui/ui/button/ActionButton';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';
import * as Q from 'q';
import {LayersContentTreeDialog} from './dialog/LayersContentTreeDialog';
import {LayerContent} from './LayerContent';

export class ShowAllContentLayersButton extends ActionButton {

    private items: LayerContent[];

    constructor() {
        super(new Action(i18n('widget.layers.showall', 0)));

        this.initListeners();
    }

    setItems(items: LayerContent[]): void {
        this.items = items;

        const total: number = items.filter((layerContent: LayerContent) => layerContent.hasItem()).length;
        this.setLabel(i18n('widget.layers.showall', total));
        this.setVisible(items.length > 1);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then(rendered => {
            this.addClass('show-all-button');

            return rendered;
        });
    }

    private initListeners(): void {
        this.getAction().onExecuted(() => {
            LayersContentTreeDialog.get().setItems(this.items).open();
        });
    }
}
