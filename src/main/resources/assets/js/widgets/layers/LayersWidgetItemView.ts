import {LayersView} from './LayersView';
import * as Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ShowAllContentLayersButton} from './ShowAllContentLayersButton';
import {MultiLayersContentLoader} from './MultiLayersContentLoader';
import {LayerContent} from './LayerContent';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LayersContentTreeDialog} from './dialog/LayersContentTreeDialog';
import {ProjectCreatedEvent} from 'lib-contentstudio/app/settings/event/ProjectCreatedEvent';
import {ProjectUpdatedEvent} from 'lib-contentstudio/app/settings/event/ProjectUpdatedEvent';
import {ProjectDeletedEvent} from 'lib-contentstudio/app/settings/event/ProjectDeletedEvent';

export class LayersWidgetItemView
    extends DivEl {

    private readonly layersView: LayersView;

    private readonly showAllButton: ShowAllContentLayersButton;

    private readonly loader: MultiLayersContentLoader;

    private items: LayerContent[] = [];

    constructor() {
        super('layers-widget-item-view');

        this.layersView = new LayersView();
        this.loader = new MultiLayersContentLoader();

        this.showAllButton = new ShowAllContentLayersButton();
        this.showAllButton.hide();

        this.initListeners();
    }

    private initListeners(): void {
        this.showAllButton.getAction().onExecuted(() => {
            LayersContentTreeDialog.get().setItems(this.items).open();
        });

        const updateHandler: () => void = () => {
            if (this.isVisible()) {
                this.reload();
            } else {
                // widget item is already detached from DOM and is not relevant
                ProjectCreatedEvent.un(updateHandler);
                ProjectUpdatedEvent.un(updateHandler);
                ProjectDeletedEvent.un(updateHandler);
            }
        };

        ProjectCreatedEvent.on(updateHandler);
        ProjectUpdatedEvent.on(updateHandler);
        ProjectDeletedEvent.on(updateHandler);
    }

    setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<any> {
        this.showAllButton.hide();
        this.loader.setItem(item);

        return this.reload();
    }

    reload(): Q.Promise<any> {
        return this.loader.load().then((items: LayerContent[]) => {
            this.items = items;
            this.layersView.setItems(items);
            this.showAllButton.updateLabelAndVisibility(items);

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
