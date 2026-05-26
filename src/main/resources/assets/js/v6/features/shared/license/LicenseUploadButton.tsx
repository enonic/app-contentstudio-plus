import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Button, type ButtonSize, type ButtonVariant} from '@enonic/ui';
import {UploadIcon} from 'lucide-react';
import {type ChangeEvent, type ReactElement, useCallback, useRef, useState} from 'react';
import {uploadLicense} from './uploadLicense';

export type LicenseUploadButtonProps = {
    size?: ButtonSize;
    variant?: ButtonVariant;
    onUploadFinished?: (isValid: boolean) => void;
};

export const LicenseUploadButton = ({
    size = 'md',
    variant = 'solid',
    onUploadFinished,
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
            <Button
                size={size}
                variant={variant}
                onClick={handleClick}
                disabled={busy}
                label={label}
                aria-label={label}
                startIcon={UploadIcon}
            />
        </>
    );
};

LicenseUploadButton.displayName = 'LicenseUploadButton';
