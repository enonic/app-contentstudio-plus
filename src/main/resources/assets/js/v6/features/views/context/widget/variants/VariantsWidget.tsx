import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {Button} from '@enonic/ui';
import {type ReactElement, useCallback, useEffect, useMemo, useState} from 'react';
import {AppHelper} from '../../../../../../util/AppHelper';
import {useCardListKeyboard} from '../shared/useCardListKeyboard';
import {CreateVariantDialog} from './CreateVariantDialog';
import {DuplicateVariantDialog} from './DuplicateVariantDialog';
import {VariantCard} from './VariantCard';
import {useVariantsData} from './useVariantsData';

const VARIANTS_WIDGET_NAME = 'VariantsWidget';

export type VariantsWidgetProps = {
    contentId: string;
};

export const VariantsWidget = ({contentId}: VariantsWidgetProps): ReactElement => {
    const {original, variants, loading, error} = useVariantsData(contentId);

    const allItems = useMemo(
        () => (original ? [original, ...variants] : variants),
        [original, variants],
    );

    const activeId = contentId;
    const [expandedId, setExpandedId] = useState<string | null>(activeId);
    const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
    const [duplicateTarget, setDuplicateTarget] = useState<ContentSummaryAndCompareStatus | null>(null);

    useEffect(() => {
        setExpandedId(activeId);
    }, [activeId]);

    const openCreateDialog = (): void => setCreateDialogOpen(true);
    const openDuplicateDialog = (target: ContentSummaryAndCompareStatus): void => setDuplicateTarget(target);
    const closeDuplicateDialog = (open: boolean): void => {
        if (!open) setDuplicateTarget(null);
    };

    const flatItems = useMemo(
        () => (original ? [original, ...variants] : []),
        [original, variants],
    );

    const handleActiveIndexChange = useCallback((index: number): void => {
        const id = flatItems[index]?.getId();
        if (id) setExpandedId(id);
    }, [flatItems]);

    const {containerRef, handleKeyDown, handleClick, registerEntry} = useCardListKeyboard({
        itemCount: flatItems.length,
        onActiveIndexChange: handleActiveIndexChange,
        enableHorizontal: true,
    });

    if (!contentId) {
        return (
            <div
                data-component={VARIANTS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} text-sm text-subtle`}
            >
                {i18n('field.contextPanel.empty')}
            </div>
        );
    }

    if (error && allItems.length === 0) {
        return (
            <div
                data-component={VARIANTS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} text-sm text-error`}
            >
                {error}
            </div>
        );
    }

    if (loading && allItems.length === 0) {
        return (
            <div
                data-component={VARIANTS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} flex flex-col gap-3`}
            >
                <div className="h-20 animate-pulse rounded-md bg-surface-muted" />
                <div className="h-20 animate-pulse rounded-md bg-surface-muted" />
            </div>
        );
    }

    if (!original) {
        return (
            <div
                data-component={VARIANTS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} text-sm text-subtle`}
            >
                {i18n('field.contextPanel.empty')}
            </div>
        );
    }

    if (variants.length === 0) {
        return (
            <div
                data-component={VARIANTS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} flex flex-col items-center gap-4 py-4`}
            >
                <Button
                    size="sm"
                    variant="solid"
                    label={i18n('widget.variants.create.text')}
                    onClick={openCreateDialog}
                />
                <CreateVariantDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    original={original}
                    variants={variants}
                />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            data-component={VARIANTS_WIDGET_NAME}
            className={`${AppHelper.getCommonExtensionContainerClass()} flex w-full max-w-full min-w-0 flex-col gap-4`}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
        >
            <div className="flex flex-col gap-2">
                <h6 className="m-0 text-xs font-semibold uppercase tracking-widest text-subtle">
                    {i18n('widget.variants.item.type.original')}
                </h6>
                <VariantCard
                    item={original}
                    isOriginal
                    isActive={original.getId() === activeId}
                    isExpanded={expandedId === original.getId()}
                    onToggle={() => setExpandedId(prev => (prev === original.getId() ? null : original.getId()))}
                    onCreateVariant={openCreateDialog}
                    index={0}
                    registerEntry={registerEntry}
                />
            </div>

            <div className="flex flex-col gap-2">
                <h6 className="m-0 text-xs font-semibold uppercase tracking-widest text-subtle">
                    {i18n('widget.variants.list.header.variants')}
                </h6>
                <div className="flex flex-col gap-3">
                    {variants.map((variant, idx) => (
                        <VariantCard
                            key={variant.getId()}
                            item={variant}
                            isOriginal={false}
                            isActive={variant.getId() === activeId}
                            isExpanded={expandedId === variant.getId()}
                            onToggle={() => setExpandedId(prev => (prev === variant.getId() ? null : variant.getId()))}
                            onDuplicate={openDuplicateDialog}
                            index={idx + 1}
                            registerEntry={registerEntry}
                        />
                    ))}
                </div>
            </div>

            <CreateVariantDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                original={original}
                variants={variants}
            />
            <DuplicateVariantDialog
                open={duplicateTarget !== null}
                onOpenChange={closeDuplicateDialog}
                variant={duplicateTarget}
                siblings={variants}
            />
        </div>
    );
};

VariantsWidget.displayName = VARIANTS_WIDGET_NAME;
