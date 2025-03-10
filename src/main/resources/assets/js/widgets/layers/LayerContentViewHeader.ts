import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {CompareStatusFormatter} from 'lib-contentstudio/app/content/CompareStatus';
import {LayerContent} from './LayerContent';
import {ProjectHelper} from 'lib-contentstudio/app/settings/data/project/ProjectHelper';

export class LayerContentViewHeader extends DivEl {

    private layerContent: LayerContent;

    private layerNameBlock: DivEl;

    private itemStatusBlock?: DivEl;

    constructor(layerContent: LayerContent, cls: string) {
        super(cls);

        this.layerContent = layerContent;

        this.initElements();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.layerNameBlock);

            if (this.itemStatusBlock) {
                this.appendChild(this.itemStatusBlock);
            }

            return rendered;
        });
    }

    private initElements(): void {
        this.layerNameBlock = new DivEl('layer-details');
        const layerName: DivEl = new DivEl('layer-name');
        layerName.setHtml(ProjectHelper.isAvailable(this.layerContent.getProject())
                          ? this.layerContent.getProject().getDisplayName()
                          : this.layerContent.getProject().getName());
        this.layerNameBlock.appendChild(layerName);

        if (this.layerContent.getProject().getLanguage()) {
            const layerLang: DivEl = new DivEl('layer-language');
            layerLang.setHtml(`(${this.layerContent.getProject().getLanguage()})`);
            this.layerNameBlock.appendChild(layerLang);
        }

        if (this.layerContent.hasItem()) {
            this.itemStatusBlock = new DivEl('status');

            this.itemStatusBlock.setHtml(this.layerContent.getItem().getStatusText());
            this.itemStatusBlock.addClass(this.layerContent.getItem().getStatusClass());
        }
    }
}
