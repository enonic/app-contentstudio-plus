import {DETAILS_WIDGET_NAME, getDetailsWidgetKey} from '@enonic/lib-contentstudio/v6/shared/lib/widget/details';
import {getVersionsWidgetKey, VERSIONS_WIDGET_NAME} from '@enonic/lib-contentstudio/v6/shared/lib/widget/versions/versions';
import type {ContextWidget} from '@enonic/lib-contentstudio/v6/widgets/context-panel/model/contextWidget.types';
import {setContextWidgets} from '@enonic/lib-contentstudio/v6/widgets/context-panel/model/contextWidgets.store';
import type {ContextPanelConfig} from '@enonic/lib-contentstudio/v6/widgets/context-panel/ui/ContextPanelView';
import {History, List, Newspaper} from 'lucide-react';
import {$config} from '../../../../shared/config';
import {i18n} from '../../../../shared/i18n';
import {$archiveContextContent} from '../../store/archive-selection';
import {ArchiveDetailsWidget} from './widget/details/ArchiveDetailsWidget';
import {ArchivePublishReportWidget} from './widget/publish-report/ArchivePublishReportWidget';
import {ArchiveVersionsWidget} from './widget/versions/ArchiveVersionsWidget';

const PUBLISH_REPORT_WIDGET_NAME = 'publish-report';

export const ARCHIVE_CONTEXT_PANEL: ContextPanelConfig = {
    widgets: {
        [DETAILS_WIDGET_NAME]: ArchiveDetailsWidget,
        [PUBLISH_REPORT_WIDGET_NAME]: ArchivePublishReportWidget,
        [VERSIONS_WIDGET_NAME]: ArchiveVersionsWidget,
    },
    content: $archiveContextContent,
};

// The archive bundle has its own copy of the widget registry, so this set replaces Studio's.
export function registerArchiveContextWidgets(): void {
    const applicationKey = $config.get().appId;

    const details: ContextWidget = {
        key: getDetailsWidgetKey(),
        name: DETAILS_WIDGET_NAME,
        applicationKey,
        title: i18n('field.contextPanel.details'),
        description: i18n('field.contextPanel.details.description'),
        icon: List,
        requiresContent: true,
    };
    const publishReport: ContextWidget = {
        key: `${applicationKey}:${PUBLISH_REPORT_WIDGET_NAME}`,
        name: PUBLISH_REPORT_WIDGET_NAME,
        applicationKey,
        title: i18n('widget.publishReport.displayName'),
        description: i18n('widget.publishReport.description'),
        icon: Newspaper,
        requiresContent: true,
    };
    const versions: ContextWidget = {
        key: getVersionsWidgetKey(),
        name: VERSIONS_WIDGET_NAME,
        applicationKey,
        title: i18n('field.contextPanel.versionHistory'),
        description: i18n('field.contextPanel.versionHistory.description'),
        icon: History,
        requiresContent: true,
    };

    setContextWidgets([details, publishReport, versions], details.key);
}
