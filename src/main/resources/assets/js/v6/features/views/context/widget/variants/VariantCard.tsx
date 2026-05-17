import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentEventsProcessor} from '@enonic/lib-contentstudio/app/ContentEventsProcessor';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {EditContentEvent} from '@enonic/lib-contentstudio/app/event/EditContentEvent';
import {PublishStatus} from '@enonic/lib-contentstudio/app/publish/PublishStatus';
import {ContentIcon} from '@enonic/lib-contentstudio/v6/features/shared/icons/ContentIcon';
import {Button, cn} from '@enonic/ui';
import {type MouseEvent, type ReactElement, useCallback, useMemo} from 'react';
import {resolveContentDisplay} from '../../../../shared/content/contentDisplay';

export type VariantCardProps = {
    item: ContentSummaryAndCompareStatus;
    isActive: boolean;
    isOriginal: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onCreateVariant?: (item: ContentSummaryAndCompareStatus) => void;
    onDuplicate?: (item: ContentSummaryAndCompareStatus) => void;
};

const STATUS_TONE: Record<string, string> = {
    online: 'text-success',
    new: 'text-subtle italic',
    modified: 'text-warn',
    pending: 'text-warn',
    offline: 'text-subtle',
    expired: 'text-error',
    archived: 'text-subtle',
    moved: 'text-subtle',
};

const getStatusTone = (statusClass: string): string => STATUS_TONE[statusClass] ?? 'text-subtle';

export const VariantCard = ({
    item,
    isActive,
    isOriginal,
    isExpanded,
    onToggle,
    onCreateVariant,
    onDuplicate,
}: VariantCardProps): ReactElement => {
    const statusText = item.getStatusText();
    const statusClass = item.getPublishStatus() === PublishStatus.ONLINE
        ? 'online'
        : (item.getStatusClass() ?? '');

    const contentDisplay = useMemo(() => resolveContentDisplay(item), [item]);
    const summary = item.getContentSummary();

    const handleEdit = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        ContentEventsProcessor.handleEdit(new EditContentEvent([item]));
    }, [item]);

    const handleCreate = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        onCreateVariant?.(item);
    }, [item, onCreateVariant]);

    const handleDuplicate = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        onDuplicate?.(item);
    }, [item, onDuplicate]);

    return (
        <fieldset
            onClick={onToggle}
            className={cn(
                'group relative m-0 min-w-0 cursor-pointer rounded-md border border-bdr-soft p-2.5 text-left text-sm transition-colors outline-none',
                'hover:bg-surface-neutral-hover',
                isExpanded && 'shadow-md',
            )}
        >
            {isActive && (
                <legend className="mx-auto px-3 text-xs font-semibold tracking-widest uppercase text-subtle">
                    Current
                </legend>
            )}

            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-5">
                <ContentIcon
                    contentType={summary.getType().toString()}
                    url={summary.getIconUrl()}
                />

                <div className="min-w-0">
                    <div className="truncate text-base font-semibold">{contentDisplay.displayName}</div>
                    <div className="truncate text-sm text-subtle">{contentDisplay.pathString}</div>
                </div>

                {statusText && (
                    <span className={cn('shrink-0 text-sm', getStatusTone(statusClass))}>
                        {statusText}
                    </span>
                )}

                {isExpanded && (
                    <div className="col-start-2 col-end-4 flex gap-2">
                        <Button
                            size="sm"
                            variant="solid"
                            label={i18n('action.edit')}
                            onClick={handleEdit}
                        />
                        {isOriginal && onCreateVariant && (
                            <Button
                                size="sm"
                                variant="outline"
                                label={i18n('widget.variants.create.text')}
                                onClick={handleCreate}
                            />
                        )}
                        {!isOriginal && onDuplicate && (
                            <Button
                                size="sm"
                                variant="outline"
                                label={i18n('action.duplicate')}
                                onClick={handleDuplicate}
                            />
                        )}
                    </div>
                )}
            </div>
        </fieldset>
    );
};

VariantCard.displayName = 'VariantCard';
