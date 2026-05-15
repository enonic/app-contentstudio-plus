import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {getActiveProjectName} from '@enonic/lib-contentstudio/v6/features/store/activeProject.store';
import {Button} from '@enonic/ui';
import {type ReactElement, useEffect, useMemo, useState} from 'react';
import {AppHelper} from '../../../../../../util/AppHelper';
import {LayerCard} from './LayerCard';
import {LayersDialog} from './LayersDialog';
import {buildLayersTree} from './layersTree';
import {useLayersData} from './useLayersData';

const LAYERS_WIDGET_NAME = 'LayersWidget';

export type LayersWidgetProps = {
    contentId: string;
};

export const LayersWidget = ({contentId}: LayersWidgetProps): ReactElement => {
    const {items, loading, error} = useLayersData(contentId);
    const activeProjectName = getActiveProjectName();

    const tree = useMemo(
        () => buildLayersTree(items, activeProjectName),
        [items, activeProjectName],
    );

    const visibleRows = tree.visible;
    const totalCount = tree.all.length;
    const hasMore = totalCount > visibleRows.length;

    const currentKey = useMemo(
        () => visibleRows.find(row => row.isCurrent)?.key ?? null,
        [visibleRows],
    );
    const [expandedKey, setExpandedKey] = useState<string | null>(currentKey);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setExpandedKey(currentKey);
    }, [currentKey]);

    const currentRow = useMemo(
        () => tree.all.find(row => row.isCurrent) ?? null,
        [tree.all],
    );
    const currentItem = currentRow?.item.hasItem() ? currentRow.item.getItem() : null;
    const dialogTitle = currentItem?.getDisplayName() || i18n('widget.layers.displayName');
    const dialogDescription = currentItem?.getPath().toString();

    if (!contentId) {
        return (
            <div
                data-component={LAYERS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} text-sm text-subtle`}
            >
                {i18n('field.contextPanel.empty')}
            </div>
        );
    }

    if (error && visibleRows.length === 0) {
        return (
            <div
                data-component={LAYERS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} text-sm text-error`}
            >
                {error}
            </div>
        );
    }

    if (loading && visibleRows.length === 0) {
        return (
            <div
                data-component={LAYERS_WIDGET_NAME}
                className={`${AppHelper.getCommonExtensionContainerClass()} flex flex-col gap-3`}
            >
                <div className="h-24 animate-pulse rounded-md bg-surface-muted" />
                <div className="h-24 animate-pulse rounded-md bg-surface-muted" />
            </div>
        );
    }

    return (
        <div
            data-component={LAYERS_WIDGET_NAME}
            className={`${AppHelper.getCommonExtensionContainerClass()} flex w-full max-w-full min-w-0 flex-col gap-4`}
        >
            <div className="flex flex-col gap-5">
                {visibleRows.map((row) => (
                    <LayerCard
                        key={row.key}
                        item={row.item}
                        isCurrent={row.isCurrent}
                        level={row.level}
                        isExpanded={expandedKey === row.key}
                        onToggle={() => setExpandedKey(prev => (prev === row.key ? null : row.key))}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        size="sm"
                        variant="outline"
                        label={i18n('widget.layers.showall', totalCount)}
                        onClick={() => setDialogOpen(true)}
                    />
                </div>
            )}

            <LayersDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                rows={tree.all}
                title={dialogTitle}
                description={dialogDescription}
            />
        </div>
    );
};

LayersWidget.displayName = LAYERS_WIDGET_NAME;
