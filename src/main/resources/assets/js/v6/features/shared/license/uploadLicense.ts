import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
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
            NotifyManager.get().showError(i18n('notify.archive.license.upload.failed'));
        }
        return isValid;
    } catch {
        NotifyManager.get().showError(i18n('notify.archive.license.upload.failed'));
        return false;
    }
}
