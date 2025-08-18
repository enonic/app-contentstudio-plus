import {ActionButton} from '@enonic/lib-admin-ui/ui/button/ActionButton';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import Q from 'q';
import {LayerContent} from './LayerContent';

export class ShowAllContentLayersButton extends ActionButton {

    constructor() {
        super(new Action(i18n('widget.layers.showall', 0)));
    }

    updateLabelAndVisibility(items: LayerContent[]): void {
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
}
