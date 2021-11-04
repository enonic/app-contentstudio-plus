import {ContextView} from 'lib-contentstudio/app/view/context/ContextView';
import * as Q from 'q';
import {WidgetView} from 'lib-contentstudio/app/view/context/WidgetView';
import {WidgetItemView} from 'lib-contentstudio/app/view/context/WidgetItemView';
import {AttachmentsWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/AttachmentsWidgetItemView';
import {ContentWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/ContentWidgetItemView';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveStatusWidgetItemView} from './widgets/ArchiveStatusWidgetItemView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchivePropertiesWidgetItemView} from './widgets/ArchivePropertiesWidgetItemView';

export class ArchiveContextView
    extends ContextView {

    private archiveItem: ArchiveContentViewItem;

    private contentWidgetItemView: ContentWidgetItemView;

    private propertiesWidgetItemView: ArchivePropertiesWidgetItemView;

    getCustomWidgetViewsAndUpdateDropdown(): Q.Promise<void> {
        this.widgetsSelectionRow.updateWidgetsDropdown(this.widgetViews);
        return Q(null);
    }

    protected getInitialWidgets(): WidgetView[] {
        return [this.propertiesWidgetView, this.createVersionsWidgetView()];
    }

    protected getDetailsWidgetItemViews(): WidgetItemView[] {
        this.contentWidgetItemView = new ContentWidgetItemView();
        this.propertiesWidgetItemView = new ArchivePropertiesWidgetItemView();

        return [
            this.contentWidgetItemView,
            new ArchiveStatusWidgetItemView(),
            this.propertiesWidgetItemView,
            new AttachmentsWidgetItemView().setContentRootPath(ContentPath.ARCHIVE_ROOT)
        ];
    }

    setArchiveItem(item: ArchiveContentViewItem) {
        this.archiveItem = item;

        if (item) {
            this.contentWidgetItemView.getViewer().whenRendered(() => {
                this.contentWidgetItemView.getViewer().getNamesAndIconView().getNamesView().setSubName(item.getOriginalFullPath());
            });
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-context-view');

            return rendered;
        });
    }
}
