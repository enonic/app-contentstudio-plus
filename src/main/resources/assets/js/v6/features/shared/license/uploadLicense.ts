import {notifyError} from '../../../../shared/notifications';
import {i18n} from '../../../../shared/i18n';
import {ValidLicenseLoadedEvent} from '../../../../event/ValidLicenseLoadedEvent';
import {postLicense} from '../../api/license';

export async function uploadLicense(file: File): Promise<boolean> {
    try {
        const isValid = await postLicense(file);
        if (isValid) {
            new ValidLicenseLoadedEvent().fire();
            window.dispatchEvent(new CustomEvent('ReloadActiveExtensionEvent'));
        } else {
            notifyError(i18n('notify.archive.license.upload.failed'));
        }
        return isValid;
    } catch {
        notifyError(i18n('notify.archive.license.upload.failed'));
        return false;
    }
}
