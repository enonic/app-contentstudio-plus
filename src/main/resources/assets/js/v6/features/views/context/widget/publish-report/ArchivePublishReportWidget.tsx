import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {$archiveContextContent} from '../../../../store/archive-selection';
import {PublishReportWidget} from './PublishReportWidget';

const ARCHIVE_PUBLISH_REPORT_WIDGET_NAME = 'ArchivePublishReportWidget';

export const ArchivePublishReportWidget = (): ReactElement | null => {
    const content = useStore($archiveContextContent);

    if (!content) return null;

    return (
        <PublishReportWidget
            contentId={content.getId()}
            firstPublished={content.getPublishFirstTime() ?? null}
            isArchived={true}
        />
    );
};

ArchivePublishReportWidget.displayName = ARCHIVE_PUBLISH_REPORT_WIDGET_NAME;
