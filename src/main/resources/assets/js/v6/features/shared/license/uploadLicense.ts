import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ValidLicenseLoadedEvent} from '../../../../event/ValidLicenseLoadedEvent';
import {UploadLicenseRequest} from '../../../../resource/UploadLicenseRequest';

export async function uploadLicense(file: File): Promise<boolean> {
    try {
        const isValid = await new UploadLicenseRequest(file).sendAndParse();
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
