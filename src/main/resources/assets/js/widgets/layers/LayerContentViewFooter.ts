import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {ActionButton} from 'lib-admin-ui/ui/button/ActionButton';
import {LayerContent} from './LayerContent';
import {LayersContentActionButton} from './LayersContentActionButton';

export class LayerContentViewFooter extends DivEl {

    private readonly layerContent: LayerContent;

    private readonly actionButton?: ActionButton;

    constructor(layerContent: LayerContent, cls: string) {
        super(cls);

        this.layerContent = layerContent;

        if (layerContent.hasItem()) {
            this.actionButton = new LayersContentActionButton(layerContent);
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            if (this.actionButton) {
                this.appendChild(this.actionButton);
            }

            return rendered;
        });
    }
}
