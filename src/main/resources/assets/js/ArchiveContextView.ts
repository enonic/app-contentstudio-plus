import {ContextView} from '@enonic/lib-contentstudio/app/view/context/ContextView';
import Q from 'q';
import {Widget} from '@enonic/lib-admin-ui/content/Widget';
import {WidgetView} from '@enonic/lib-contentstudio/app/view/context/WidgetView';
import {WidgetItemView} from '@enonic/lib-contentstudio/app/view/context/WidgetItemView';
import {AttachmentsWidgetItemView} from '@enonic/lib-contentstudio/app/view/context/widget/details/AttachmentsWidgetItemView';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {ArchiveStatusExtensionItemView} from './extensions/ArchiveStatusExtensionItemView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchivePropertiesExtensionItemView} from './extensions/ArchivePropertiesExtensionItemView';
import {ArchiveExtensionItemView} from './extensions/ArchiveExtensionItemView';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class ArchiveContextView
    extends ContextView {

    private static allowedWidgetIds = ['publish-report'];

    private archiveWidgetItemView: ArchiveExtensionItemView;

    private propertiesWidgetItemView: ArchivePropertiesExtensionItemView;

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
        this.archiveWidgetItemView = new ArchiveExtensionItemView();
        this.propertiesWidgetItemView = new ArchivePropertiesExtensionItemView();

        return [
            this.archiveWidgetItemView,
            new ArchiveStatusExtensionItemView(),
            this.propertiesWidgetItemView,
            new AttachmentsWidgetItemView().setContentRootPath(ContentPath.ARCHIVE_ROOT),
        ];
    }
}
