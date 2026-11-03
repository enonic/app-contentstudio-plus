import {ActionDialog} from '@enonic/ui-kit';
import {type ReactElement, useCallback, useRef} from 'react';
import {i18n} from '../../../../shared/i18n';
import {renderRoot} from '../../../../shared/renderRoot';
import {useDialogInitialFocus} from '../lib/hooks/useDialogInitialFocus';
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
    const uploadButtonRef = useRef<HTMLButtonElement>(null);
    const handleOpenAutoFocus = useDialogInitialFocus(uploadButtonRef);

    const handleOpenChange = useCallback((next: boolean): void => {
        onOpenChange?.(next);
    }, [onOpenChange]);

    const handleUploadFinished = useCallback((isValid: boolean): void => {
        if (isValid) {
            onOpenChange?.(false);
        }
    }, [onOpenChange]);

    return (
        <ActionDialog.Root open={open} onOpenChange={handleOpenChange}>
            <ActionDialog.Portal>
                <ActionDialog.Overlay />
                <ActionDialog.Content
                    data-component={NO_LICENSE_DIALOG_NAME}
                    size="medium"
                    onOpenAutoFocus={handleOpenAutoFocus}
                >
                    <ActionDialog.DefaultHeader title={title} description={description} withClose />
                    <ActionDialog.Footer>
                        <LicenseUploadButton
                            buttonRef={uploadButtonRef}
                            dialogShortcut
                            size="lg"
                            onUploadFinished={handleUploadFinished}
                        />
                    </ActionDialog.Footer>
                </ActionDialog.Content>
            </ActionDialog.Portal>
        </ActionDialog.Root>
    );
};

NoLicenseDialog.displayName = NO_LICENSE_DIALOG_NAME;

export function openNoLicenseDialog(): void {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const root = renderRoot(host, 'no-license-dialog', (
        <NoLicenseDialog
            onOpenChange={(next) => {
                if (!next) {
                    root.unmount();
                    host.remove();
                }
            }}
        />
    ));
}
