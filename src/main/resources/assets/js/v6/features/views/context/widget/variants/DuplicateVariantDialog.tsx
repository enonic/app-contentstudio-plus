import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentDuplicateParams} from '@enonic/lib-contentstudio/app/resource/ContentDuplicateParams';
import {ContentIcon} from '@enonic/lib-contentstudio/v6/features/shared/icons/ContentIcon';
import {Button, Dialog} from '@enonic/ui';
import {type ReactElement, useCallback} from 'react';
import {resolveContentDisplay} from '../../../../shared/content/contentDisplay';
import {duplicateAndEdit} from './duplicateAndEdit';
import {getNextAvailableVariantName} from './variantName';

const DUPLICATE_VARIANT_DIALOG_NAME = 'DuplicateVariantDialog';

export type DuplicateVariantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant: ContentSummaryAndCompareStatus | null;
    siblings: ContentSummaryAndCompareStatus[];
};

export const DuplicateVariantDialog = ({
    open,
    onOpenChange,
    variant,
    siblings,
}: DuplicateVariantDialogProps): ReactElement => {
    const handleDuplicate = useCallback((): void => {
        if (!variant) return;

        const variantOf = variant.getContentSummary().getVariantOf();
        if (!variantOf) return;

        const name = getNextAvailableVariantName(siblings);
        const params = new ContentDuplicateParams(variant.getContentId())
            .setIncludeChildren(false)
            .setVariant(true)
            .setParent(variant.getPath().getParentPath().toString())
            .setName(name);

        duplicateAndEdit(params, variantOf, name);

        onOpenChange(false);
    }, [variant, siblings, onOpenChange]);

    if (!variant) {
        return <Dialog.Root open={false} />;
    }

    const summary = variant.getContentSummary();
    const display = resolveContentDisplay(variant);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content
                    className="sm:h-fit md:max-w-180 md:max-h-[85vh] w-full gap-5"
                    data-component={DUPLICATE_VARIANT_DIALOG_NAME}
                >
                    <Dialog.DefaultHeader
                        title={i18n('action.duplicate')}
                        withClose
                    />
                    <Dialog.Body className="flex flex-col gap-2.5 p-2">
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
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button
                            className="self-end"
                            size="lg"
                            variant="solid"
                            label={i18n('action.duplicate')}
                            onClick={handleDuplicate}
                        />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

DuplicateVariantDialog.displayName = DUPLICATE_VARIANT_DIALOG_NAME;
