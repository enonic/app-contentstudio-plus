import {i18n} from '../../../../shared/i18n';
import {Button, Dialog, type ButtonSize, type ButtonVariant} from '@enonic/ui';
import {UploadIcon} from 'lucide-react';
import {type ChangeEvent, type ReactElement, type RefObject, useCallback, useRef, useState} from 'react';
import {uploadLicense} from './uploadLicense';

export type LicenseUploadButtonProps = {
    size?: ButtonSize;
    variant?: ButtonVariant;
    onUploadFinished?: (isValid: boolean) => void;
    buttonRef?: RefObject<HTMLButtonElement | null>;
    dialogShortcut?: boolean;
};

export const LicenseUploadButton = ({
    size = 'md',
    variant = 'solid',
    onUploadFinished,
    buttonRef,
    dialogShortcut = false,
}: LicenseUploadButtonProps): ReactElement => {
    const label = i18n('action.license.upload');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleChange = useCallback(async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;
        setBusy(true);
        try {
            const isValid = await uploadLicense(file);
            onUploadFinished?.(isValid);
        } finally {
            setBusy(false);
        }
    }, [onUploadFinished]);

    const uploadButton = (
        <Button
            ref={buttonRef}
            data-component="Button"
            size={size}
            variant={variant}
            onClick={handleClick}
            disabled={busy}
            label={label}
            aria-label={label}
            startIcon={UploadIcon}
        />
    );

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                aria-label={label}
                onChange={event => void handleChange(event)}
                className="sr-only"
                tabIndex={-1}
            />
            {dialogShortcut ? <Dialog.Shortcut asChild>{uploadButton}</Dialog.Shortcut> : uploadButton}
        </>
    );
};

LicenseUploadButton.displayName = 'LicenseUploadButton';
