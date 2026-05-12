import {Extension} from '@enonic/lib-admin-ui/extension/Extension';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContextView} from '@enonic/lib-contentstudio/app/view/context/ContextView';
import {ExtensionView, InternalExtensionType} from '@enonic/lib-contentstudio/app/view/context/ExtensionView';
import {History, List, Newspaper} from 'lucide-react';
import {ArchiveDetailsWidgetElement} from './v6/features/views/context/widget/details/ArchiveDetailsWidget';
import {PublishReportWidgetElement} from './v6/features/views/context/widget/publish-report/ArchivePublishReportWidget';
import {ArchiveVersionsWidgetElement} from './v6/features/views/context/widget/versions/ArchiveVersionsWidget';

export function createArchiveContextView(): ContextView {
    const contextView = new ContextView();
    contextView.addClass('archive-context-view');

    const propertiesWidget = createPropertiesWidget(contextView);
    const publishReportWidget = createPublishReportWidget(contextView);
    const versionsWidget = createVersionsWidget(contextView);

    contextView.setWidgets([propertiesWidget, publishReportWidget, versionsWidget], propertiesWidget);

    return contextView;
}

function createPropertiesWidget(contextView: ContextView): ExtensionView {
    const appId = CONFIG.getString('appId');

    return ExtensionView.create()
        .setExtension(Extension.create().setExtensionDescriptorKey(`${appId}:details`).build())
        .setName(i18n('field.contextPanel.details'))
        .setDescription(i18n('field.contextPanel.details.description'))
        .setExtensionClass('properties-widget')
        .setIconClass('icon-list')
        .setIcon(List)
        .setType(InternalExtensionType.INFO)
        .setContextView(contextView)
        .addExtensionItemView(new ArchiveDetailsWidgetElement())
        .build();
}

function createPublishReportWidget(contextView: ContextView): ExtensionView {
    const appId = CONFIG.getString('appId');

    return ExtensionView.create()
        .setExtension(Extension.create().setExtensionDescriptorKey(`${appId}:publish-report`).build())
        .setName(i18n('widget.publishReport.displayName'))
        .setDescription(i18n('widget.publishReport.description'))
        .setIcon(Newspaper)
        .setContextView(contextView)
        .addExtensionItemView(new PublishReportWidgetElement())
        .build();
}

function createVersionsWidget(contextView: ContextView): ExtensionView {
    const appId = CONFIG.getString('appId');

    return ExtensionView.create()
        .setExtension(Extension.create().setExtensionDescriptorKey(`${appId}:versions`).build())
        .setName(i18n('field.contextPanel.versionHistory'))
        .setDescription(i18n('field.contextPanel.versionHistory.description'))
        .setIcon(History)
        .setContextView(contextView)
        .addExtensionItemView(new ArchiveVersionsWidgetElement())
        .build();
}
