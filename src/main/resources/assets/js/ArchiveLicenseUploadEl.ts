import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {Element, NewElementBuilder} from '@enonic/lib-admin-ui/dom/Element';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {UploadLicenseRequest} from './resource/UploadLicenseRequest';

export class ArchiveLicenseUploadEl
    extends DivEl {

    private readonly input: Element;

    private readonly label: LabelEl;

    private uploadFinishedListeners: { (isValid: boolean): void }[] = [];

    constructor() {
        super('license-uploader');

        this.input = new Element(new NewElementBuilder().setTagName('input').setGenerateId(true).setClassName('license-uploader-input'));
        this.input.getEl().setAttribute('type', 'file');
        this.label = new LabelEl(i18n('action.license.upload'), this.input, 'license-uploader-label');

        this.initListeners();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.label, this.input);

            return rendered;
        });
    }

    onUploadFinished(listener: (isValid: boolean) => void): void {
        this.uploadFinishedListeners.push(listener);
    }

    unUploadFinished(listener: (isValid: boolean) => void): void {
        this.uploadFinishedListeners = this.uploadFinishedListeners.filter(curr => curr !== listener);
    }

    private initListeners(): void {
        this.input.getEl().addEventListener('change', () => {
            this.uploadLicense();
        });
    }

    private uploadLicense(): void {
        let isValid = false;

        new UploadLicenseRequest((<HTMLInputElement>this.input.getHTMLElement()).files[0]).sendAndParse().then(
            (isValidLicense: boolean) => {
                if (isValidLicense) {
                    window.dispatchEvent(new CustomEvent('ReloadActiveWidgetEvent'));
                    window.dispatchEvent(new CustomEvent('ValidLicenseLoadedEvent'));
                    isValid = true;
                }
            }).catch(() => {
            NotifyManager.get().showError(i18n('notify.archive.license.upload.failed'));
        }).finally(() => {
            this.notifyUploadFinished(isValid);
        });
    }

    private notifyUploadFinished(isValid: boolean): void {
        this.uploadFinishedListeners.forEach(listener => listener(isValid));
    }
}
