import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import {Dialog} from '@enonic/ui';
import {type ReactElement, useCallback} from 'react';
import {LicenseUploadButton} from './LicenseUploadButton';

const NO_LICENSE_DIALOG_NAME = 'NoLicenseDialog';

export type NoLicenseDialogProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const NoLicenseDialog = ({
    open = true,
    onOpenChange,
}: NoLicenseDialogProps): ReactElement => {
    const title = i18n('dialog.archive.license.missing');
    const description = i18n('notify.archive.license.missing');

    const handleOpenChange = useCallback((next: boolean): void => {
        onOpenChange?.(next);
    }, [onOpenChange]);

    const handleUploadFinished = useCallback((isValid: boolean): void => {
        if (isValid) {
            onOpenChange?.(false);
        }
    }, [onOpenChange]);

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content
                    data-component={NO_LICENSE_DIALOG_NAME}
                    className="sm:h-fit md:min-w-120 md:max-w-160 md:max-h-[85vh] gap-8"
                >
                    <Dialog.DefaultHeader title={title} description={description} withClose />
                    <Dialog.Footer className="flex items-center justify-end gap-2.5">
                        <LicenseUploadButton size="lg" onUploadFinished={handleUploadFinished} />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

NoLicenseDialog.displayName = NO_LICENSE_DIALOG_NAME;

export class NoLicenseDialogElement extends LegacyElement<typeof NoLicenseDialog, NoLicenseDialogProps> {

    constructor() {
        super({open: false}, NoLicenseDialog);
    }

    open(): void {
        Body.get().appendChild(this);
        this.setProps({
            open: true,
            onOpenChange: (next) => {
                if (!next) {
                    this.close();
                }
            },
        });
    }

    close(): void {
        this.setProps({open: false});
        const parent = this.getParentElement();
        if (parent) {
            parent.removeChild(this);
        }
    }
}
