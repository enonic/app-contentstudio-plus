import {ActionDialog} from '@enonic/ui-kit';
import {type ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDialogInitialFocus} from '../../../../shared/lib/hooks/useDialogInitialFocus';
import {LayerCard} from './LayerCard';
import {type LayerRow} from './layersTree';

const LAYERS_DIALOG_NAME = 'LayersDialog';

export type LayersDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rows: LayerRow[];
    title: string;
    description?: string;
};

export const LayersDialog = ({open, onOpenChange, rows, title, description}: LayersDialogProps): ReactElement => {
    const currentKey = useMemo(
        () => rows.find(row => row.isCurrent)?.key ?? null,
        [rows],
    );
    const [expandedKey, setExpandedKey] = useState<string | null>(currentKey);
    const actionButtonRef = useRef<HTMLButtonElement>(null);
    const handleOpenAutoFocus = useDialogInitialFocus(actionButtonRef);

    useEffect(() => {
        setExpandedKey(currentKey);
    }, [open, currentKey]);

    const handleToggle = useCallback((key: string): void => {
        setExpandedKey(prev => (prev === key ? null : key));
    }, []);

    return (
        <ActionDialog.Root open={open} onOpenChange={onOpenChange}>
            <ActionDialog.Portal>
                <ActionDialog.Overlay />
                <ActionDialog.Content
                    className="h-full max-sm:max-h-none sm:h-fit md:max-h-[85vh]"
                    data-component={LAYERS_DIALOG_NAME}
                    size="wide"
                    onOpenAutoFocus={handleOpenAutoFocus}
                >
                    <ActionDialog.DefaultHeader title={title} description={description} withClose />
                    <ActionDialog.Body className="gap-5">
                        {rows.map(row => (
                            <LayerCard
                                key={row.key}
                                item={row.item}
                                isCurrent={row.isCurrent}
                                isInChain={row.isInChain}
                                level={row.level}
                                isExpanded={expandedKey === row.key}
                                onToggle={() => handleToggle(row.key)}
                                actionButtonRef={row.isCurrent ? actionButtonRef : undefined}
                                dialogShortcut
                            />
                        ))}
                    </ActionDialog.Body>
                </ActionDialog.Content>
            </ActionDialog.Portal>
        </ActionDialog.Root>
    );
};

LayersDialog.displayName = LAYERS_DIALOG_NAME;
