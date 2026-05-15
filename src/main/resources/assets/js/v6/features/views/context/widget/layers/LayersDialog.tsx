import {Dialog} from '@enonic/ui';
import {type ReactElement, useEffect, useMemo, useState} from 'react';
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

    useEffect(() => {
        if (open) {
            setExpandedKey(currentKey);
        }
    }, [open, currentKey]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content
                    className="sm:h-fit md:max-w-180 md:max-h-[85vh] lg:max-w-220 h-full w-full gap-5"
                    data-component={LAYERS_DIALOG_NAME}
                >
                    <Dialog.DefaultHeader title={title} description={description} withClose />
                    <Dialog.Body className="flex flex-col gap-5 overflow-y-auto p-2 -m-2">
                        {rows.map(row => (
                            <LayerCard
                                key={row.key}
                                item={row.item}
                                isCurrent={row.isCurrent}
                                level={row.level}
                                isExpanded={expandedKey === row.key}
                                onToggle={() => setExpandedKey(prev => (prev === row.key ? null : row.key))}
                            />
                        ))}
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

LayersDialog.displayName = LAYERS_DIALOG_NAME;
