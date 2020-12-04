import {WidgetItemView} from 'lib-contentstudio/app/view/context/WidgetItemView';
import {LayersView} from './LayersView';
import * as Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ShowAllContentLayersButton} from './ShowAllContentLayersButton';
import {MultiLayersContentLoader} from './MultiLayersContentLoader';
import {LayerContent} from './LayerContent';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LayersContentTreeDialog} from './dialog/LayersContentTreeDialog';

export class LayersWidgetItemView
    extends DivEl {

    private readonly layersView: LayersView;

    private readonly showAllButton: ShowAllContentLayersButton;

    private readonly loader: MultiLayersContentLoader;

    constructor() {
        super('widget-item-view');

        this.layersView = new LayersView();
        this.loader = new MultiLayersContentLoader();

        this.showAllButton = new ShowAllContentLayersButton();
        this.showAllButton.hide();
    }

    setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<any> {
        this.showAllButton.hide();
        this.loader.setItem(item);

        return this.reload();
    }

    reload(): Q.Promise<any> {
        return this.loader.load().then((items: LayerContent[]) => {
            this.layersView.setItems(items);
            this.showAllButton.setItems(items);
            if (LayersContentTreeDialog.get().isOpen()) {
                LayersContentTreeDialog.get().setItems(items);
            }
        }).catch(DefaultErrorHandler.handle);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.layersView);
            this.appendChild(this.showAllButton);
            return rendered;
        });
    }
}
