import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useI18n} from '../../../../../../shared/i18n';
import {ContentIcon} from '../../../../shared/icons/ContentIcon';
import {$archiveContextContent} from '../../../../store/archive-selection';

const ARCHIVE_DETAILS_WIDGET_CONTENT_SECTION_NAME = 'ArchiveDetailsWidgetContentSection';

export const ArchiveDetailsWidgetContentSection = (): ReactElement | null => {
    const content = useStore($archiveContextContent);

    const iconLabel = useI18n('field.contextPanel.details.sections.content.icon');
    const statusLabel = useI18n('field.contextPanel.details.sections.content.status');
    const displayNameLabel = useI18n('field.displayName');
    const pathLabel = useI18n('field.originalPath');
    const archivedLabel = useI18n('status.archived');

    if (!content) return null;

    const {displayName, originalPath} = content;

    return (
        <section data-component={ARCHIVE_DETAILS_WIDGET_CONTENT_SECTION_NAME}>
            <dl className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <dt className="text-xs text-subtle">{iconLabel}</dt>
                    <dd>
                        <ContentIcon contentType={content.type} url={content.iconUrl} />
                    </dd>
                </div>

                <div className="flex flex-col gap-1">
                    <dt className="text-xs text-subtle">{statusLabel}</dt>
                    <dd>
                        <span className="capitalize text-sm">{archivedLabel}</span>
                    </dd>
                </div>

                {displayName && (
                    <div className="flex flex-col gap-1">
                        <dt className="text-xs text-subtle">{displayNameLabel}</dt>
                        <dd className="text-sm truncate">{displayName}</dd>
                    </div>
                )}

                {originalPath && (
                    <div className="flex flex-col gap-1">
                        <dt className="text-xs text-subtle">{pathLabel}</dt>
                        <dd className="text-sm truncate" title={originalPath}>{originalPath}</dd>
                    </div>
                )}
            </dl>
        </section>
    );
};

ArchiveDetailsWidgetContentSection.displayName = ARCHIVE_DETAILS_WIDGET_CONTENT_SECTION_NAME;
