import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import type {ContentSummaryAndCompareStatus}
    from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ExtensionItemViewType}
    from '@enonic/lib-contentstudio/app/view/context/ExtensionItemView';
import {fetchVersion} from '@enonic/lib-contentstudio/v6/entities/content/api/versions.api';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/shared/ui/LegacyElement';
import {$activeWidgetId, $isContextOpen}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/model/contextWidgets.store';
import {getVersionsWidgetKey}
    from '@enonic/lib-contentstudio/v6/shared/lib/widget/versions/versions';
import {loadContentVersions}
    from '@enonic/lib-contentstudio/v6/entities/content/version';
import type {VersionsConfig}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/config/VersionsConfig';
import {VersionsConfigProvider}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/config/VersionsConfigContext';
import {VersionsList}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/VersionsList';
import {useStore} from '@nanostores/preact';
import Q from 'q';
import {useMemo, type ReactElement} from 'react';
import {$archiveContextContent} from '../../../../store/archive-selection';

const ARCHIVE_VERSIONS_WIDGET_NAME = 'ArchiveVersionsWidget';

const createArchiveVersionsConfig = (): VersionsConfig => ({
    services: {
        loadVersions: loadContentVersions,
        fetchVersion,
    },
    notify: {
        showSuccess: (message) => NotifyManager.get().showSuccess(message),
    },
    handleError: (err) => DefaultErrorHandler.handle(err),
});

export const ArchiveVersionsWidget = (): ReactElement | null => {
    const isContextOpen = useStore($isContextOpen);
    const activeWidget = useStore($activeWidgetId);
    const isActiveWidget = activeWidget === getVersionsWidgetKey();
    const content = useStore($archiveContextContent);
    const config = useMemo(() => createArchiveVersionsConfig(), []);

    if (!isContextOpen || !isActiveWidget || !content) return null;

    return (
        <VersionsConfigProvider config={config}>
            <VersionsList content={content} />
        </VersionsConfigProvider>
    );
};

ArchiveVersionsWidget.displayName = ARCHIVE_VERSIONS_WIDGET_NAME;

export class ArchiveVersionsWidgetElement
    extends LegacyElement<typeof ArchiveVersionsWidget>
    implements ExtensionItemViewType {

    constructor() {
        super({}, ArchiveVersionsWidget);
    }

    public layout(): Q.Promise<void> {
        return Q();
    }

    public setContentAndUpdateView(_item: ContentSummaryAndCompareStatus): Q.Promise<null | void> {
        return Q();
    }

    public fetchExtensionContents(_url: string, _contentId: string): Q.Promise<void> {
        return Q();
    }

    public hide(): void {
        return;
    }

    public show(): void {
        return;
    }
}
