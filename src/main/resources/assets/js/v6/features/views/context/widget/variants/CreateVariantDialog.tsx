import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentDuplicateParams} from '@enonic/lib-contentstudio/app/resource/ContentDuplicateParams';
import {ContentIcon} from '@enonic/lib-contentstudio/v6/features/shared/icons/ContentIcon';
import {Button, Dialog, Input} from '@enonic/ui';
import {type ChangeEvent, type ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {resolveContentDisplay} from '../../../../shared/content/contentDisplay';
import {duplicateAndEdit} from './duplicateAndEdit';
import {getNextAvailableVariantName, isVariantNameOccupied} from './variantName';

const CREATE_VARIANT_DIALOG_NAME = 'CreateVariantDialog';

export type CreateVariantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    original: ContentSummaryAndCompareStatus | null;
    variants: ContentSummaryAndCompareStatus[];
};

export const CreateVariantDialog = ({
    open,
    onOpenChange,
    original,
    variants,
}: CreateVariantDialogProps): ReactElement => {
    const [name, setName] = useState<string>('');
    const prevOpenRef = useRef(false);

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
        const params = new ContentDuplicateParams(original.getContentId())
            .setIncludeChildren(false)
            .setVariant(true)
            .setParent(original.getPath().toString())
            .setName(trimmed);

        duplicateAndEdit(params, original.getId(), trimmed);

        onOpenChange(false);
    }, [original, name, validation.valid, onOpenChange]);

    if (!original) {
        return <Dialog.Root open={false} />;
    }

    const summary = original.getContentSummary();
    const display = resolveContentDisplay(original);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content
                    className="sm:h-fit md:max-w-180 md:max-h-[85vh] w-full gap-5"
                    data-component={CREATE_VARIANT_DIALOG_NAME}
                >
                    <Dialog.DefaultHeader
                        title={i18n('widget.variants.create.text')}
                        withClose
                    />
                    <Dialog.Body className="flex flex-col gap-5 overflow-visible p-2">
                        <div className="flex flex-col gap-2">
                            <h6 className="m-0 text-xs font-semibold uppercase tracking-widest text-subtle">
                                {i18n('widget.variants.dialog.create.original')}
                            </h6>
                            <div className="flex items-center gap-2.5">
                                <ContentIcon
                                    contentType={summary.getType().toString()}
                                    url={summary.getIconUrl()}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-base font-semibold">{display.displayName}</div>
                                    <div className="truncate text-sm text-subtle">{display.pathString}</div>
                                </div>
                            </div>
                        </div>

                        <Input
                            label={i18n('widget.variants.dialog.create.input.name.label')}
                            value={name}
                            onChange={handleNameChange}
                            error={validation.error}
                            autoFocus
                        />
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button
                            className="self-end"
                            size="lg"
                            variant="solid"
                            label={i18n('widget.variants.create.text')}
                            disabled={!validation.valid}
                            onClick={handleCreate}
                        />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

CreateVariantDialog.displayName = CREATE_VARIANT_DIALOG_NAME;
