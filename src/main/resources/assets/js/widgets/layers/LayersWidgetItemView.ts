import * as Q from 'q';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ActionButton} from '@enonic/lib-admin-ui/ui/button/ActionButton';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Store} from '@enonic/lib-admin-ui/store/Store';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ProjectCreatedEvent} from 'lib-contentstudio/app/settings/event/ProjectCreatedEvent';
import {ProjectDeletedEvent} from 'lib-contentstudio/app/settings/event/ProjectDeletedEvent';
import {ProjectUpdatedEvent} from 'lib-contentstudio/app/settings/event/ProjectUpdatedEvent';
import {LayerContent} from './LayerContent';
import {LayersContentTreeDialog} from './LayersContentTreeDialog';
import {LayersContentTreeList} from './LayersContentTreeList';
import {MultiLayersContentLoader} from './MultiLayersContentLoader';

export class LayersWidgetItemView
    extends DivEl {

    private readonly layersContentTreeList: LayersContentTreeList;

    private readonly loader: MultiLayersContentLoader;

    private readonly showHideToggle: ActionButton;

    private item: ContentSummaryAndCompareStatus;

    private constructor() {
        super('layers-widget-item-view');

        this.layersContentTreeList = new LayersContentTreeList();
        this.loader = new MultiLayersContentLoader();
        this.showHideToggle = new ActionButton(new Action(i18n('widget.layers.showall', 0)));

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

        return this.reload().catch(DefaultErrorHandler.handle);
    }

    reload(): Q.Promise<void> {
        return this.loader.load().then((items: LayerContent[]) => {
            this.layersContentTreeList.setAllItems(items);
            this.showHideToggle.setLabel(i18n('widget.layers.showall', items.length));
            this.showHideToggle.setVisible(this.layersContentTreeList.hasLayersToHide());

            return Q();
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.layersContentTreeList);
            this.appendChild(this.showHideToggle);

            this.showHideToggle.addClass('show-all-button');
            return rendered;
        });
    }

    private initListeners(): void {
        this.initProjectEventListeners();
        this.initContentEventListeners();

        this.showHideToggle.onClicked(() => {
            LayersContentTreeDialog.get().setItems(this.layersContentTreeList.getAllItems()).open();
        });
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
