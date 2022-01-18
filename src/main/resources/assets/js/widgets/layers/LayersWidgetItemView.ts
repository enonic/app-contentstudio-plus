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
import {Store} from 'lib-admin-ui/store/Store';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {ContentServerChangeItem} from 'lib-contentstudio/app/event/ContentServerChangeItem';

export const LAYERS_WIDGET_ITEM_VIEW = 'LayersWidgetItemView';

export class LayersWidgetItemView
    extends DivEl {

    private readonly layersView: LayersView;

    private readonly showAllButton: ShowAllContentLayersButton;

    private readonly loader: MultiLayersContentLoader;

    private layerContentItems: LayerContent[] = [];

    private item: ContentSummaryAndCompareStatus;

    private constructor() {
        super('layers-widget-item-view');

        this.layersView = new LayersView();
        this.loader = new MultiLayersContentLoader();

        this.showAllButton = new ShowAllContentLayersButton();
        this.showAllButton.hide();

        this.initListeners();
    }

    static get(): LayersWidgetItemView {
        let instance: LayersWidgetItemView = Store.instance().get(LAYERS_WIDGET_ITEM_VIEW);

        if (instance == null) {
            instance = new LayersWidgetItemView();
            Store.instance().set(LAYERS_WIDGET_ITEM_VIEW, instance);
        }

        return instance;
    }

    setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<any> {
        this.item = item;

        this.showAllButton.hide();
        this.loader.setItem(item);

        return this.reload();
    }

    reload(): Q.Promise<any> {
        return this.loader.load().then((items: LayerContent[]) => {
            this.layerContentItems = items;
            this.layersView.setItems(items);
            this.showAllButton.updateLabelAndVisibility(items);

            if (LayersContentTreeDialog.get().isOpen()) {
                LayersContentTreeDialog.get().setItems(items);
            }

            return Q(null);
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.layersView);
            this.appendChild(this.showAllButton);
            return rendered;
        });
    }

    private initListeners(): void {
        this.showAllButton.getAction().onExecuted(() => {
            LayersContentTreeDialog.get().setItems(this.layerContentItems).open();
        });

        this.listenProjectEvents();
        this.listenContentEvents();
    }

    private listenProjectEvents(): void {
        const projectUpdateHandler: () => void = () => {
            if (this.isVisible()) {
                this.reload().catch(DefaultErrorHandler.handle);
            }
        };

        ProjectCreatedEvent.on(projectUpdateHandler);
        ProjectUpdatedEvent.on(projectUpdateHandler);
        ProjectDeletedEvent.on(projectUpdateHandler);
    }

    private listenContentEvents(): void {
        const serverEventsHandler: ContentServerEventsHandler = ContentServerEventsHandler.getInstance();

        const contentDeletedHandler: (items: ContentServerChangeItem[]) => void = (items: ContentServerChangeItem[]) => {
            if (!this.isVisible()) {
                return;
            }

            const id: string = this.item.getContentId().toString();

            if (items.some((deletedOrArchivedItem: ContentServerChangeItem) => deletedOrArchivedItem.getContentId().toString() === id)) {
                if (LayersContentTreeDialog.get().isOpen()) {
                    LayersContentTreeDialog.get().close();
                }
            }
        };

        const updateHandler: (items: ContentSummaryAndCompareStatus[]) => void = (items: ContentSummaryAndCompareStatus[]) => {
            if (!this.isVisible()) {
                return;
            }

            const id: string = this.item.getContentId().toString();

            if (items.some((item: ContentSummaryAndCompareStatus) => item.getId() === id)) {
                this.reload().catch(DefaultErrorHandler.handle);
            }
        };

        serverEventsHandler.onContentDeleted(contentDeletedHandler);
        serverEventsHandler.onContentUpdated(updateHandler);
    }
}
