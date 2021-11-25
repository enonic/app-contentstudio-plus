import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LayerContent} from './LayerContent';
import {LayerContentViewHeader} from './LayerContentViewHeader';
import {LayerContentViewBody} from './LayerContentViewBody';
import {LayerContentViewFooter} from './LayerContentViewFooter';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';

export class LayerContentViewDataBlock extends DivEl {

    private static CURRENT_CLASS = 'layer-current';

    private static INHERITED_CLASS = 'item-inherited';

    private static READONLY_CLASS = 'readonly';

    private readonly layerContent: LayerContent;

    private header: LayerContentViewHeader;

    private body: LayerContentViewBody;

    private footer: LayerContentViewFooter;

    constructor(layerContent: LayerContent, cls: string) {
        super(cls);

        this.layerContent = layerContent;

        this.initElements(cls);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.header);
            this.appendChildren(this.body);
            this.appendChildren(this.footer);

            if (ProjectContext.get().getProject().getName() === this.layerContent.getProject().getName()) {
                this.addClass(LayerContentViewDataBlock.CURRENT_CLASS);
            }

            if (this.layerContent.hasItem()) {
                if (this.layerContent.getItem().isDataInherited()) {
                    this.addClass(LayerContentViewDataBlock.INHERITED_CLASS);
                }

                if (this.layerContent.getItem().isReadOnly()) {
                    this.addClass(LayerContentViewDataBlock.READONLY_CLASS);
                }
            } else {
                this.addClass('not-available');
            }

            return rendered;
        });
    }

    private initElements(parentCls: string): void {
        this.header = new LayerContentViewHeader(this.layerContent, `${parentCls}-header`);
        this.body = new LayerContentViewBody(this.layerContent, `${parentCls}-body`);
        this.footer = new LayerContentViewFooter(this.layerContent, `${parentCls}-footer`);
    }
}
