import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentLocalizer} from '@enonic/lib-contentstudio/app/browse/action/ContentLocalizer';
import {ContentEventsProcessor} from '@enonic/lib-contentstudio/app/ContentEventsProcessor';
import {EditContentEvent} from '@enonic/lib-contentstudio/app/event/EditContentEvent';
import {PublishStatus} from '@enonic/lib-contentstudio/app/publish/PublishStatus';
import {ProjectIcon} from '@enonic/lib-contentstudio/v6/features/shared/icons/ProjectIcon';
import {Button, cn} from '@enonic/ui';
import {Layers2} from 'lucide-react';
import {type MouseEvent, type ReactElement, useCallback, useMemo} from 'react';
import {LayerContent} from '../../../../../../extension/layers/LayerContent';
import {resolveContentDisplay} from '../../../../shared/content/contentDisplay';

export type LayerCardProps = {
    item: LayerContent;
    isCurrent: boolean;
    level: number;
    isExpanded: boolean;
    onToggle: () => void;
};

const LEVEL_INDENT_PX = 24;

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

export const LayerCard = ({item, isCurrent, level, isExpanded, onToggle}: LayerCardProps): ReactElement => {
    const isChild = level > 0;
    const project = item.getProject();
    const hasItem = item.hasItem();
    const content = hasItem ? item.getItem() : null;

    const statusText = content?.getStatusText() ?? '';
    const statusClass = content?.getPublishStatus() === PublishStatus.ONLINE
        ? 'online'
        : (content?.getStatusClass() ?? '');
    const isInherited = !!content?.isDataInherited();
    const isReadOnly = !!content?.isReadOnly();
    const contentDisplay = useMemo(
        () => (content ? resolveContentDisplay(content) : null),
        [content],
    );

    type ActionMode = 'localize' | 'edit' | 'open';

    const actionMode: ActionMode = isReadOnly
        ? 'open'
        : isInherited
            ? 'localize'
            : isCurrent
                ? 'edit'
                : 'open';

    const actionLabelKey =
        actionMode === 'localize' ? 'action.translate'
            : actionMode === 'edit' ? 'action.edit'
                : 'action.open';

    const handleLocalize = useCallback((): void => {
        if (!content) return;
        new ContentLocalizer().localizeAndEdit([content]).catch(DefaultErrorHandler.handle);
    }, [content]);

    const handleEdit = useCallback((): void => {
        if (!content) return;
        ContentEventsProcessor.handleEdit(new EditContentEvent([content], project.getName()));
    }, [content, project]);

    const handleAction = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        if (actionMode === 'localize') {
            handleLocalize();
        } else {
            handleEdit();
        }
    }, [actionMode, handleLocalize, handleEdit]);

    const projectLabel = project.getDisplayName() || project.getName();
    const projectLang = project.getLanguage();

    const indentPx = Math.max(level - 1, 0) * LEVEL_INDENT_PX;

    return (
        <div
            className="flex w-full items-stretch gap-1.5"
            style={indentPx > 0 ? {paddingLeft: indentPx} : undefined}
        >
            {isChild && (
                <div
                    className="flex w-4 shrink-0 items-center justify-center text-base text-subtle select-none"
                    aria-hidden="true"
                >
                    ↳
                </div>
            )}

            <fieldset
                onClick={onToggle}
                className={cn(
                    'group relative m-0 min-w-0 flex-1 cursor-pointer rounded-md border border-bdr-soft p-2.5 text-left text-sm transition-colors outline-none',
                    'hover:bg-surface-neutral-hover',
                    isExpanded && 'shadow-md',
                    !hasItem && 'opacity-60',
                )}
            >
                {isCurrent && (
                    <legend className="mx-auto px-3 text-xs font-semibold tracking-widest uppercase text-subtle">
                        Current
                    </legend>
                )}

                <div className="flex min-w-0 items-center justify-between gap-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm">
                        {projectLabel}{projectLang && ` (${projectLang})`}
                    </span>
                    {hasItem && statusText && (
                        <span className={cn('shrink-0 text-sm', getStatusTone(statusClass))}>
                            {statusText}
                        </span>
                    )}
                </div>

                {hasItem && content && (
                    <div className="mt-2.5 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-5">
                        <ProjectIcon
                            projectName={project.getName()}
                            language={project.getLanguage()}
                            hasIcon={!!project.getIcon()}
                            className="size-6"
                        />

                        <div className="min-w-0">
                            <div className="truncate text-base font-semibold">{contentDisplay?.displayName}</div>
                            <div className="truncate text-sm text-subtle">{contentDisplay?.pathString}</div>
                        </div>

                        <span
                            className={cn(
                                'inline-flex items-center p-1',
                                isInherited ? 'text-subtle' : 'text-main',
                            )}
                            aria-hidden="true"
                        >
                            <Layers2 size={14} strokeWidth={1.5} />
                        </span>

                        {isExpanded && (
                            <div className="col-start-2 flex">
                                <Button
                                    size="sm"
                                    variant="solid"
                                    label={i18n(actionLabelKey)}
                                    onClick={handleAction}
                                />
                            </div>
                        )}
                    </div>
                )}

                {!hasItem && (
                    <div className="mt-2 text-center text-xs italic text-subtle">
                        {i18n('dialog.layers.notAvailable')}
                    </div>
                )}
            </fieldset>
        </div>
    );
};

LayerCard.displayName = 'LayerCard';
