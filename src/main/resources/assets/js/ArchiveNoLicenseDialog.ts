import {H6El} from 'lib-admin-ui/dom/H6El';
import {ModalDialog} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ArchiveLicenseUploadEl} from './ArchiveLicenseUploadEl';

export class ArchiveNoLicenseDialog
    extends ModalDialog {

    private readonly licenseUploadEl: ArchiveLicenseUploadEl;

    constructor() {
        super({
            title: i18n('dialog.archive.license.missing'),
            class: 'archive-no-license-dialog',
        });

        this.licenseUploadEl = new ArchiveLicenseUploadEl();
        this.licenseUploadEl.onUploadFinished(() => this.close());
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            const notificationEl = new H6El('notification-dialog-text').setHtml(i18n('notify.archive.license.missing'));
            this.appendChildToContentPanel(notificationEl);
            this.appendChildToContentPanel(this.licenseUploadEl);

            return rendered;
        });
    }
}
