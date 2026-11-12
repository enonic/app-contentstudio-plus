import {notifyError} from '../../../../shared/notifications';
import {i18n} from '../../../../shared/i18n';
import {fireValidLicenseLoaded} from '../../../../event/validLicenseLoaded';
import {postLicense} from '../../api/license';

export async function uploadLicense(file: File): Promise<boolean> {
    try {
        const isValid = await postLicense(file);
        if (isValid) {
            fireValidLicenseLoaded();
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
