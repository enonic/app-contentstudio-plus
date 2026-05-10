import {IconButton, Separator, Tooltip} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Copy} from 'lucide-react';
import {type ReactElement, useCallback, useEffect, useMemo, useState} from 'react';
import {ContentSummaryAndCompareStatus}
    from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ExtensionPropertiesItemViewValue}
    from '@enonic/lib-contentstudio/app/view/context/extension/details/ExtensionPropertiesItemViewValue';
import {useI18n} from '@enonic/lib-contentstudio/v6/features/hooks/useI18n';
import {$archiveContextContent} from '../../../../store/archive-selection';
import {ArchivePropertiesExtensionItemViewHelper} from '../../../../../../extension/ArchivePropertiesExtensionItemViewHelper';

type ContentProps = Map<string, ExtensionPropertiesItemViewValue>;

const ARCHIVE_DETAILS_WIDGET_INFO_SECTION_NAME = 'ArchiveDetailsWidgetInfoSection';

export const ArchiveDetailsWidgetInfoSection = (): ReactElement | null => {
    const helper = useMemo(() => new ArchivePropertiesExtensionItemViewHelper(), []);
    const content = useStore($archiveContextContent);
    const [props, setProps] = useState<ContentProps>(new Map());

    const titleText = useI18n('field.contextPanel.details.sections.info');
    const copyTooltip = useI18n('field.contextPanel.details.sections.info.copy');

    const copyToClipboard = useCallback((text: string): void => {
        void navigator?.clipboard?.writeText(text);
    }, []);

    useEffect(() => {
        if (!content) {
            setProps(new Map());
            return;
        }

        let cancelled = false;
        helper.setItem(ContentSummaryAndCompareStatus.fromContentSummary(content));
        void helper.generateProps().then((result) => {
            if (!cancelled) setProps(result);
        });

        return () => {
            cancelled = true;
        };
    }, [content, helper]);

    const renderPropertyRow = useCallback((key: string, value: ExtensionPropertiesItemViewValue): ReactElement => {
        const isId = key === 'Id';
        const title = value.getTitle() ?? '';
        const displayName = value.getDisplayName();

        return (
            <div key={key} className="contents">
                <dt className="text-xs text-subtle">{key}</dt>
                <dd className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-xs truncate" title={title}>
                        {displayName}
                    </span>
                    {isId && (
                        <Tooltip delay={150} value={copyTooltip} side="left">
                            <IconButton
                                className="size-4 shrink-0"
                                size="sm"
                                icon={Copy}
                                iconSize={14}
                                aria-label={copyTooltip}
                                onClick={() => copyToClipboard(displayName)}
                            />
                        </Tooltip>
                    )}
                </dd>
            </div>
        );
    }, [copyTooltip, copyToClipboard]);

    if (!content) return null;

    return (
        <section data-component={ARCHIVE_DETAILS_WIDGET_INFO_SECTION_NAME} className="flex flex-col gap-5">
            <Separator label={titleText} />

            <dl className="grid grid-cols-[max-content_1fr] items-center gap-x-7.5 gap-y-2.5">
                {Array.from(props.entries()).map(([key, value]) => renderPropertyRow(key, value))}
            </dl>
        </section>
    );
};

ArchiveDetailsWidgetInfoSection.displayName = ARCHIVE_DETAILS_WIDGET_INFO_SECTION_NAME;
