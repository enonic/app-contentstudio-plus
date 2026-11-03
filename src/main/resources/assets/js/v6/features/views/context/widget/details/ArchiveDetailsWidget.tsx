import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {$archiveContextContent} from '../../../../store/archive-selection';
import {ArchiveDetailsWidgetAttachmentsSection} from './ArchiveDetailsWidgetAttachmentsSection';
import {ArchiveDetailsWidgetContentSection} from './ArchiveDetailsWidgetContentSection';
import {ArchiveDetailsWidgetInfoSection} from './ArchiveDetailsWidgetInfoSection';

const ARCHIVE_DETAILS_WIDGET_NAME = 'ArchiveDetailsWidget';

export const ArchiveDetailsWidget = (): ReactElement | null => {
    const content = useStore($archiveContextContent);

    if (!content) return null;

    return (
        <div data-component={ARCHIVE_DETAILS_WIDGET_NAME} className="flex flex-col gap-7.5">
            <ArchiveDetailsWidgetContentSection />
            <ArchiveDetailsWidgetInfoSection />
            <ArchiveDetailsWidgetAttachmentsSection />
        </div>
    );
};

ArchiveDetailsWidget.displayName = ARCHIVE_DETAILS_WIDGET_NAME;
