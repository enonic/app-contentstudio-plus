import {i18n} from '../../../../../../shared/i18n';
import {ContentIcon} from '@enonic/lib-contentstudio/v6/shared/ui/icons/ContentIcon';
import {Dialog, Input} from '@enonic/ui';
import {ActionDialog} from '@enonic/ui-kit';
import {type ChangeEvent, type ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {resolveContentDisplay} from '../../../../shared/content/contentDisplay';
import {useDialogInitialFocus} from '../../../../shared/lib/hooks/useDialogInitialFocus';
import {duplicateAndEdit} from './duplicateAndEdit';
import type {VariantContent} from '../../../../shared/content/variantContent';
import {getNextAvailableVariantName, isVariantNameOccupied} from './variantName';

const CREATE_VARIANT_DIALOG_NAME = 'CreateVariantDialog';

export type CreateVariantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    original: VariantContent | null;
    variants: VariantContent[];
};

export const CreateVariantDialog = ({
    open,
    onOpenChange,
    original,
    variants,
}: CreateVariantDialogProps): ReactElement => {
    const [name, setName] = useState<string>('');
    const prevOpenRef = useRef(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const handleOpenAutoFocus = useDialogInitialFocus(nameInputRef);

    useEffect(() => {
        if (open && !prevOpenRef.current) {
            setName(getNextAvailableVariantName(variants));
        }
        prevOpenRef.current = open;
    }, [open, variants]);

    const validation = useMemo(() => {
        const trimmed = name.trim();
        if (!trimmed) {
            return {valid: false, error: ''};
        }
        if (isVariantNameOccupied(trimmed, variants)) {
            return {valid: false, error: i18n('widget.variants.dialog.create.input.name.occupied')};
        }
        return {valid: true, error: ''};
    }, [name, variants]);

    const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        setName(event.currentTarget.value);
    }, []);

    const handleCreate = useCallback((): void => {
        if (!original || !validation.valid) return;

        const trimmed = name.trim();
        duplicateAndEdit({contentId: original.id, parent: original.path, name: trimmed}, original.id, trimmed);
        onOpenChange(false);
    }, [original, name, validation.valid, onOpenChange]);

    if (!original) {
        return <ActionDialog.Root open={false} />;
    }

    const display = resolveContentDisplay(original);

    return (
        <ActionDialog.Root open={open} onOpenChange={onOpenChange}>
            <ActionDialog.Portal>
                <ActionDialog.Overlay />
                <ActionDialog.Content
                    data-component={CREATE_VARIANT_DIALOG_NAME}
                    size="medium"
                    onOpenAutoFocus={handleOpenAutoFocus}
                >
                    <ActionDialog.DefaultHeader title={i18n('widget.variants.create.text')} withClose />
                    <ActionDialog.Body className="gap-5 overflow-visible">
                        <div className="flex flex-col gap-2">
                            <h6 className="m-0 text-xs font-semibold uppercase tracking-widest text-subtle">
                                {i18n('widget.variants.dialog.create.original')}
                            </h6>
                            <div className="flex items-center gap-2.5">
                                <ContentIcon contentType={original.type} url={original.iconUrl} />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-base font-semibold">{display.displayName}</div>
                                    <div className="truncate text-sm text-subtle">{display.pathString}</div>
                                </div>
                            </div>
                        </div>

                        <Input
                            ref={nameInputRef}
                            label={i18n('widget.variants.dialog.create.input.name.label')}
                            value={name}
                            onChange={handleNameChange}
                            error={validation.error}
                        />
                    </ActionDialog.Body>
                    <ActionDialog.Footer>
                        <Dialog.Shortcut asChild>
                            <ActionDialog.Action
                                data-component="Button"
                                label={i18n('widget.variants.create.text')}
                                disabled={!validation.valid}
                                closeOnClick={false}
                                onClick={handleCreate}
                            />
                        </Dialog.Shortcut>
                    </ActionDialog.Footer>
                </ActionDialog.Content>
            </ActionDialog.Portal>
        </ActionDialog.Root>
    );
};

CreateVariantDialog.displayName = CREATE_VARIANT_DIALOG_NAME;
