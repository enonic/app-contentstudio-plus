import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import Q from 'q';
import {getActiveProjectName} from '@enonic/lib-contentstudio/v6/features/store/activeProject.store';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {LayerContent} from './LayerContent';
import {LayersContentTreeList} from './LayersContentTreeList';
import {Element} from '@enonic/lib-admin-ui/dom/Element';

export class LayersContentTreeDialog extends ModalDialog {

    private layersContentTreeList: LayersContentTreeList;

    private subTitle: H6El;

    constructor(container: Element) {
        super({
            class: 'layers-content-tree-dialog',
            container: container
        });
    }

    setItems(items: LayerContent[]): LayersContentTreeDialog {
        const currentProjectName: string = getActiveProjectName();
        const content: ContentSummaryAndCompareStatus =
            items.find((item: LayerContent) => item.getProject().getName() === currentProjectName).getItem();

        this.setHeading(content.getDisplayName());
        this.subTitle.setHtml(content.getPath().toString());

        this.layersContentTreeList.setItems(items);

        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildToHeader(this.subTitle);
            this.appendChildToContentPanel(this.layersContentTreeList);

            return rendered;
        });
    }

    protected initElements(): void {
        super.initElements();

        this.subTitle = new H6El('sub-title');
        this.layersContentTreeList = new LayersContentTreeList();
    }
}
