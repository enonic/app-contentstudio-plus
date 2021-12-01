import {ContextView} from 'lib-contentstudio/app/view/context/ContextView';
import * as Q from 'q';
import {WidgetView} from 'lib-contentstudio/app/view/context/WidgetView';
import {WidgetItemView} from 'lib-contentstudio/app/view/context/WidgetItemView';
import {AttachmentsWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/AttachmentsWidgetItemView';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveStatusWidgetItemView} from './widgets/ArchiveStatusWidgetItemView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchivePropertiesWidgetItemView} from './widgets/ArchivePropertiesWidgetItemView';
import {ArchiveWidgetItemView} from './widgets/ArchiveWidgetItemView';

export class ArchiveContextView
    extends ContextView {

    private archiveItem: ArchiveContentViewItem;

    private archiveWidgetItemView: ArchiveWidgetItemView;

    private propertiesWidgetItemView: ArchivePropertiesWidgetItemView;

    constructor() {
        super();

        this.addClass('archive-context-view');
    }

    getCustomWidgetViewsAndUpdateDropdown(): Q.Promise<void> {
        this.widgetsSelectionRow.updateWidgetsDropdown(this.widgetViews);
        return Q(null);
    }

    protected getInitialWidgets(): WidgetView[] {
        return [this.propertiesWidgetView, this.createVersionsWidgetView()];
    }

    protected getDetailsWidgetItemViews(): WidgetItemView[] {
        this.archiveWidgetItemView = new ArchiveWidgetItemView();
        this.propertiesWidgetItemView = new ArchivePropertiesWidgetItemView();

        return [
            this.archiveWidgetItemView,
            new ArchiveStatusWidgetItemView(),
            this.propertiesWidgetItemView,
            new AttachmentsWidgetItemView().setContentRootPath(ContentPath.ARCHIVE_ROOT)
        ];
    }

    setArchiveItem(item: ArchiveContentViewItem) {
        this.archiveItem = item;

        if (item) {
            this.archiveWidgetItemView.whenRendered(() => {
                this.archiveWidgetItemView.setSubName(item.getOriginalFullPath());
            });
        }
    }
}
