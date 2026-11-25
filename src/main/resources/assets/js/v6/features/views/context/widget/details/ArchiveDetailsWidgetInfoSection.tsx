import {IconButton, Separator, Tooltip} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Copy} from 'lucide-react';
import {type ReactElement, useEffect, useState} from 'react';
import {i18n, useI18n} from '../../../../../../shared/i18n';
import {fetchPrincipalNames} from '../../../../api/principals';
import type {ArchivedContent} from '../../../../shared/content/archivedContent';
import {formatDateTime} from '../../../../shared/lib/formatDateTime';
import {$archiveContextContent} from '../../../../store/archive-selection';

type InfoRow = {
    key: string;
    label: string;
    value: string;
    title?: string;
    copyable?: boolean;
};

type PrincipalNames = ReadonlyMap<string, string>;

const NO_NAMES: PrincipalNames = new Map();

const ARCHIVE_DETAILS_WIDGET_INFO_SECTION_NAME = 'ArchiveDetailsWidgetInfoSection';

const principalKeys = ({creator, modifier, owner, archivedBy}: ArchivedContent): string[] =>
    [creator, modifier, owner, archivedBy].filter((key): key is string => !!key);

const byRow = (key: string, labelKey: string, time: Date | undefined, principal: string | undefined, names: PrincipalNames): InfoRow[] =>
    time && principal
        ? [{key, label: i18n(labelKey), value: i18n('text.by', formatDateTime(time), names.get(principal) ?? principal)}]
        : [];

function toRows(content: ArchivedContent, names: PrincipalNames): InfoRow[] {
    const separatorIndex = content.type.indexOf(':');
    const ownerName = content.owner ? names.get(content.owner) : undefined;

    return [
        {key: 'id', label: i18n('field.id'), value: content.id, copyable: true},
        {key: 'type', label: i18n('field.type'), value: content.type.slice(separatorIndex + 1) || content.type},
        {key: 'app', label: i18n('field.app'), value: content.type.slice(0, Math.max(separatorIndex, 0))},
        ...byRow('created', 'field.created', content.createdTime, content.creator, names),
        ...byRow('modified', 'field.modified', content.modifiedTime, content.modifier, names),
        ...byRow('archived', 'field.archived', content.archivedTime, content.archivedBy, names),
        ...(content.firstPublished
            ? [{key: 'firstPublished', label: i18n('field.firstPublished'), value: formatDateTime(content.firstPublished)}]
            : []),
        ...(content.language ? [{key: 'lang', label: i18n('field.lang'), value: content.language}] : []),
        ...(content.owner
            ? [{key: 'owner', label: i18n('field.owner'), value: ownerName ?? content.owner, title: ownerName ? content.owner : undefined}]
            : []),
    ];
}

export const ArchiveDetailsWidgetInfoSection = (): ReactElement | null => {
    const content = useStore($archiveContextContent);
    const [names, setNames] = useState<PrincipalNames>(NO_NAMES);

    const titleText = useI18n('field.contextPanel.details.sections.info');
    const copyTooltip = useI18n('field.contextPanel.details.sections.info.copy');

    useEffect(() => {
        if (!content) {
            return;
        }

        let cancelled = false;
        fetchPrincipalNames(principalKeys(content)).then(
            (result) => {
                if (!cancelled) setNames(new Map(result));
            },
            (error: unknown) => console.error(error),
        );

        return () => {
            cancelled = true;
        };
    }, [content]);

    if (!content) return null;

    return (
        <section data-component={ARCHIVE_DETAILS_WIDGET_INFO_SECTION_NAME} className="flex flex-col gap-5">
            <Separator label={titleText} />

            <dl className="grid grid-cols-[max-content_1fr] items-center gap-x-7.5 gap-y-2.5">
                {toRows(content, names).map(({key, label, value, title, copyable}) => (
                    <div key={key} className="contents">
                        <dt className="text-xs text-subtle">{label}</dt>
                        <dd className="flex items-center justify-between gap-2 overflow-hidden">
                            <span className="text-xs truncate" title={title ?? ''}>
                                {value}
                            </span>
                            {copyable && (
                                <Tooltip delay={150} value={copyTooltip} side="left">
                                    <IconButton
                                        className="size-4 shrink-0"
                                        size="sm"
                                        icon={Copy}
                                        iconSize={14}
                                        aria-label={copyTooltip}
                                        onClick={() => void navigator?.clipboard?.writeText(value)}
                                    />
                                </Tooltip>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};

ArchiveDetailsWidgetInfoSection.displayName = ARCHIVE_DETAILS_WIDGET_INFO_SECTION_NAME;
