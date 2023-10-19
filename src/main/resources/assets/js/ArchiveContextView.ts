import {ContextView} from 'lib-contentstudio/app/view/context/ContextView';
import * as Q from 'q';
import {Widget} from '@enonic/lib-admin-ui/content/Widget';
import {WidgetView} from 'lib-contentstudio/app/view/context/WidgetView';
import {WidgetItemView} from 'lib-contentstudio/app/view/context/WidgetItemView';
import {AttachmentsWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/AttachmentsWidgetItemView';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveStatusWidgetItemView} from './widgets/ArchiveStatusWidgetItemView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchivePropertiesWidgetItemView} from './widgets/ArchivePropertiesWidgetItemView';
import {ArchiveWidgetItemView} from './widgets/ArchiveWidgetItemView';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class ArchiveContextView
    extends ContextView {

    private static allowedWidgetIds = ['publish-report'];

    private archiveWidgetItemView: ArchiveWidgetItemView;

    private propertiesWidgetItemView: ArchivePropertiesWidgetItemView;

    constructor() {
        super();
        this.addClass('archive-context-view');
    }

    protected fetchCustomWidgetViews(): Q.Promise<Widget[]> {
        const appId = CONFIG.getString('appId');
        const allowedWidgetIds = ArchiveContextView.allowedWidgetIds.map((widgetId: string) =>
            // If allowed widgetId is missing appId, assume it's from the Content Studio+ app
            widgetId.split(':').length == 2 ? widgetId : `${appId}:${widgetId}`
        );
        const allowedWidgets = super.fetchCustomWidgetViews().then((widgets: Widget[]) =>
            widgets.filter((widget: Widget) => allowedWidgetIds.indexOf(widget.getWidgetDescriptorKey().toString()) > -1)
        );

        return Q(allowedWidgets);
    }

    setArchiveItem(item: ArchiveContentViewItem): void {
        if (item) {
            this.archiveWidgetItemView.whenRendered(() => {
                this.archiveWidgetItemView.setSubName(item.getOriginalFullPath());
            });
        }
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
            new AttachmentsWidgetItemView().setContentRootPath(ContentPath.ARCHIVE_ROOT),
        ];
    }
}
