import {handleError} from '../../../../../../shared/errors';
import {notifySuccess} from '../../../../../../shared/notifications';
import {fetchVersion} from '@enonic/lib-contentstudio/v6/entities/content/api/versions.api';
import {loadContentVersions}
    from '@enonic/lib-contentstudio/v6/entities/content/version';
import type {VersionsConfig}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/config/VersionsConfig';
import {VersionsConfigProvider}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/config/VersionsConfigContext';
import {VersionsList}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/VersionsList';
import {useStore} from '@nanostores/preact';
import {useMemo, type ReactElement} from 'react';
import {$archiveContextContent} from '../../../../store/archive-selection';

const ARCHIVE_VERSIONS_WIDGET_NAME = 'ArchiveVersionsWidget';

const createArchiveVersionsConfig = (): VersionsConfig => ({
    services: {
        loadVersions: loadContentVersions,
        fetchVersion,
    },
    notify: {
        showSuccess: notifySuccess,
    },
    handleError,
});

export const ArchiveVersionsWidget = (): ReactElement | null => {
    const content = useStore($archiveContextContent);
    const config = useMemo(() => createArchiveVersionsConfig(), []);

    if (!content) return null;

    return (
        <div data-component={ARCHIVE_VERSIONS_WIDGET_NAME}>
            <VersionsConfigProvider config={config}>
                <VersionsList content={content} />
            </VersionsConfigProvider>
        </div>
    );
};

ArchiveVersionsWidget.displayName = ARCHIVE_VERSIONS_WIDGET_NAME;
