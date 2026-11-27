import {Link, Separator} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Paperclip} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../../../../../shared/i18n';
import {getArchivedAttachmentUrl} from '../../../../api/archive';
import {$archiveContextContent} from '../../../../store/archive-selection';

const ARCHIVE_DETAILS_WIDGET_ATTACHMENTS_SECTION_NAME = 'ArchiveDetailsWidgetAttachmentsSection';

export const ArchiveDetailsWidgetAttachmentsSection = (): ReactElement | null => {
    const content = useStore($archiveContextContent);
    const titleText = useI18n('field.contextPanel.details.sections.attachments');

    if (!content || content.attachments.length === 0) return null;

    return (
        <section data-component={ARCHIVE_DETAILS_WIDGET_ATTACHMENTS_SECTION_NAME} className="flex flex-col gap-5">
            <Separator label={titleText} />
            <ul className="list-none">
                {content.attachments.map((name) => (
                    <li key={name} className="w-full">
                        <Link
                            className="flex items-center gap-2 shrink-1"
                            leftIcon={Paperclip}
                            href={getArchivedAttachmentUrl(content.id, name)}
                            target="_blank"
                        >
                            <span className="text-xs truncate">{name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};

ArchiveDetailsWidgetAttachmentsSection.displayName = ARCHIVE_DETAILS_WIDGET_ATTACHMENTS_SECTION_NAME;
