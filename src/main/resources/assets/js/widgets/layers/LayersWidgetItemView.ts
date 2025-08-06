import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {LayersView} from './LayersView';
import Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ShowAllContentLayersButton} from './ShowAllContentLayersButton';
import {MultiLayersContentLoader} from './MultiLayersContentLoader';
import {LayerContent} from './LayerContent';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {Store} from '@enonic/lib-admin-ui/store/Store';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {ProjectCreatedEvent} from 'lib-contentstudio/app/settings/event/ProjectCreatedEvent';
import {ProjectDeletedEvent} from 'lib-contentstudio/app/settings/event/ProjectDeletedEvent';
import {ProjectUpdatedEvent} from 'lib-contentstudio/app/settings/event/ProjectUpdatedEvent';
import * as Q from 'q';
import {LayerContent} from './LayerContent';
import {LayersContentTreeList} from './LayersContentTreeList';
import {MultiLayersContentLoader} from './MultiLayersContentLoader';

export class LayersWidgetItemView
    extends DivEl {

    private readonly layersContentTreeList: LayersContentTreeList;

    private readonly loader: MultiLayersContentLoader;

    private item: ContentSummaryAndCompareStatus;

    private constructor() {
        super('layers-widget-item-view');

        this.layersContentTreeList = new LayersContentTreeList();
        this.loader = new MultiLayersContentLoader();

        this.initListeners();
    }

    static get(): LayersWidgetItemView {
        let instance: LayersWidgetItemView = Store.instance().get(LayersWidgetItemView.name);

        if (instance == null) {
            instance = new LayersWidgetItemView();
            Store.instance().set(LayersWidgetItemView.name, instance);
        }

        return instance;
    }

    setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<void> {
        this.item = item;
        this.loader.setItem(item);

        return this.reload();
    }

    reload(): Q.Promise<void> {
        return this.loader.load().then((items: LayerContent[]) => {
            this.layersContentTreeList.setItems(items);

            return Q();
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.layersContentTreeList);
            return rendered;
        });
    }

    private initListeners(): void {
        this.initProjectEventListeners();
        this.initContentEventListeners();
    }

    private initProjectEventListeners(): void {
        const projectUpdateHandler: () => void = () => {
            if (this.isVisible()) {
                this.reload().catch(DefaultErrorHandler.handle);
            }
        };

        ProjectCreatedEvent.on(projectUpdateHandler);
        ProjectUpdatedEvent.on(projectUpdateHandler);
        ProjectDeletedEvent.on(projectUpdateHandler);
    }

    private initContentEventListeners(): void {
        const serverEventsHandler: ContentServerEventsHandler = ContentServerEventsHandler.getInstance();

        const updateHandler: (items: ContentSummaryAndCompareStatus[]) => void = (items: ContentSummaryAndCompareStatus[]) => {
            if (!this.isVisible()) {
                return;
            }

            const id: string = this.item.getContentId().toString();

            if (items.some((item: ContentSummaryAndCompareStatus) => item.getId() === id)) {
                this.reload().catch(DefaultErrorHandler.handle);
            }
        };

        serverEventsHandler.onContentUpdated(updateHandler);
    }
}
