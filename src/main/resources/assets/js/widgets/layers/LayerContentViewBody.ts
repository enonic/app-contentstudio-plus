import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LangBasedContentSummaryViewer} from './LangBasedContentSummaryViewer';
import {LayerContent} from './LayerContent';
import {i18n} from 'lib-admin-ui/util/Messages';

export class LayerContentViewBody extends DivEl {

    private layerContent: LayerContent;

    private itemViewer?: LangBasedContentSummaryViewer;

    private notAvailableBlock?: DivEl;

    constructor(layerContent: LayerContent, cls: string) {
        super(cls);

        this.layerContent = layerContent;

        this.initElements();
    }

    private initElements() {
        if (this.layerContent.hasItem()) {
            this.itemViewer = new LangBasedContentSummaryViewer(this.layerContent.getProject());
            this.itemViewer.setObject(this.layerContent.getItem());
        } else {
            this.notAvailableBlock = new DivEl('not-available-info').setHtml(i18n('dialog.layers.notAvailable'));
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            if (this.layerContent.hasItem()) {
                this.appendChild(this.itemViewer);
            } else {
                this.appendChild(this.notAvailableBlock);
            }

            return rendered;
        });
    }
}
