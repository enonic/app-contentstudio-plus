import {Link, Separator} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Paperclip} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useI18n';
import {$archiveAttachments, getArchiveAttachmentUrl} from '../../../../api/archive-attachments';
import {$archiveContextContent} from '../../../../store/archive-selection';

const ARCHIVE_DETAILS_WIDGET_ATTACHMENTS_SECTION_NAME = 'ArchiveDetailsWidgetAttachmentsSection';

export const ArchiveDetailsWidgetAttachmentsSection = (): ReactElement | null => {
    const content = useStore($archiveContextContent);
    const attachments = useStore($archiveAttachments);
    const titleText = useI18n('field.contextPanel.details.sections.attachments');

    if (!content || !attachments || attachments.getSize() === 0) return null;

    return (
        <section data-component={ARCHIVE_DETAILS_WIDGET_ATTACHMENTS_SECTION_NAME} className="flex flex-col gap-5">
            <Separator label={titleText} />
            <ul className="list-none">
                {attachments.map((attachment) => {
                    const name = attachment.getName().toString();
                    return (
                        <li key={name} className="w-full">
                            <Link
                                className="flex items-center gap-2 shrink-1"
                                leftIcon={Paperclip}
                                href={getArchiveAttachmentUrl(content.getContentId(), name)}
                                target="_blank"
                            >
                                <span className="text-xs truncate">{name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

ArchiveDetailsWidgetAttachmentsSection.displayName = ARCHIVE_DETAILS_WIDGET_ATTACHMENTS_SECTION_NAME;
