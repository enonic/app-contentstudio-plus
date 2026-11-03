import {i18n} from '../../../../../../shared/i18n';
import {ContentIcon} from '@enonic/lib-contentstudio/v6/shared/ui/icons/ContentIcon';
import {Dialog} from '@enonic/ui';
import {ActionDialog} from '@enonic/ui-kit';
import {type ReactElement, useCallback, useRef} from 'react';
import {resolveContentDisplay} from '../../../../shared/content/contentDisplay';
import {parentPath} from '../../../../shared/content/contentPath';
import {useDialogInitialFocus} from '../../../../shared/lib/hooks/useDialogInitialFocus';
import {duplicateAndEdit} from './duplicateAndEdit';
import type {VariantContent} from '../../../../shared/content/variantContent';
import {getNextAvailableVariantName} from './variantName';

const DUPLICATE_VARIANT_DIALOG_NAME = 'DuplicateVariantDialog';

export type DuplicateVariantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant: VariantContent | null;
    siblings: VariantContent[];
};

export const DuplicateVariantDialog = ({
    open,
    onOpenChange,
    variant,
    siblings,
}: DuplicateVariantDialogProps): ReactElement => {
    const duplicateButtonRef = useRef<HTMLButtonElement>(null);
    const handleOpenAutoFocus = useDialogInitialFocus(duplicateButtonRef);

    const handleDuplicate = useCallback((): void => {
        if (!variant) return;

        if (!variant.variantOf) return;

        const name = getNextAvailableVariantName(siblings);
        duplicateAndEdit({contentId: variant.id, parent: parentPath(variant.path), name}, variant.variantOf, name);
        onOpenChange(false);
    }, [variant, siblings, onOpenChange]);

    if (!variant) {
        return <ActionDialog.Root open={false} />;
    }

    const display = resolveContentDisplay(variant);

    return (
        <ActionDialog.Root open={open} onOpenChange={onOpenChange}>
            <ActionDialog.Portal>
                <ActionDialog.Overlay />
                <ActionDialog.Content
                    data-component={DUPLICATE_VARIANT_DIALOG_NAME}
                    size="medium"
                    onOpenAutoFocus={handleOpenAutoFocus}
                >
                    <ActionDialog.DefaultHeader title={i18n('action.duplicate')} withClose />
                    <ActionDialog.Body className="gap-2.5">
                        <div className="flex items-center gap-2.5">
                            <ContentIcon contentType={variant.type} url={variant.iconUrl} />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-base font-semibold">{display.displayName}</div>
                                <div className="truncate text-sm text-subtle">{display.pathString}</div>
                            </div>
                        </div>
                    </ActionDialog.Body>
                    <ActionDialog.Footer>
                        <Dialog.Shortcut asChild>
                            <ActionDialog.Action
                                data-component="Button"
                                ref={duplicateButtonRef}
                                label={i18n('action.duplicate')}
                                closeOnClick={false}
                                onClick={handleDuplicate}
                            />
                        </Dialog.Shortcut>
                    </ActionDialog.Footer>
                </ActionDialog.Content>
            </ActionDialog.Portal>
        </ActionDialog.Root>
    );
};

DuplicateVariantDialog.displayName = DUPLICATE_VARIANT_DIALOG_NAME;
