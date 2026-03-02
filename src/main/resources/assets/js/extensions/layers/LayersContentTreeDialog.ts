import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import Q from 'q';
import {ProjectContext} from '@enonic/lib-contentstudio/app/project/ProjectContext';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {Extension} from '../Extension';
import {LayerContent} from './LayerContent';
import {LayersContentTreeList} from './LayersContentTreeList';
import {Store} from '@enonic/lib-admin-ui/store/Store';
import {Element} from '@enonic/lib-admin-ui/dom/Element';

export class LayersContentTreeDialog extends ModalDialog {

    private layersContentTreeList: LayersContentTreeList;

    private subTitle: H6El;

    private constructor(container: Element) {
        super({
            class: 'layers-content-tree-dialog',
            container: container
        });
    }

    static get(hostElement: Element): LayersContentTreeDialog {
        let instance: LayersContentTreeDialog = Store.instance().get(LayersContentTreeDialog.name);
        const container = Extension.getContainer(hostElement);

        if (instance == null) {
            instance = new LayersContentTreeDialog(container);
            Store.instance().set(LayersContentTreeDialog.name, instance);
        } else {
            instance.setContainer(container);
        }

        return instance;
    }

    setItems(items: LayerContent[]): LayersContentTreeDialog {
        const currentProjectName: string = ProjectContext.get().getProject().getName();
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
