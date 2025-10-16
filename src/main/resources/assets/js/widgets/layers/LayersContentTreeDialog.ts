import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import Q from 'q';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {LayerContent} from './LayerContent';
import {LayersContentTreeList} from './LayersContentTreeList';
import {Store} from '@enonic/lib-admin-ui/store/Store';

export class LayersContentTreeDialog extends ModalDialog {

    private layersContentTreeList: LayersContentTreeList;

    private subTitle: H6El;

    private constructor() {
        super({class: 'layers-content-tree-dialog'});
    }

    static get(): LayersContentTreeDialog {
        let instance: LayersContentTreeDialog = Store.instance().get(LayersContentTreeDialog.name);

        if (instance == null) {
            instance = new LayersContentTreeDialog();
            Store.instance().set(LayersContentTreeDialog.name, instance);
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
