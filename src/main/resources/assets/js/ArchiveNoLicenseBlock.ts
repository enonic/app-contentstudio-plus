import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {ArchiveLicenseUploadEl} from './ArchiveLicenseUploadEl';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {i18n} from 'lib-admin-ui/util/Messages';

export class ArchiveNoLicenseBlock
    extends DivEl {

    private textBlock: SpanEl;

    private uploaderEl: ArchiveLicenseUploadEl;

    constructor() {
        super('no-license-block');

        this.initElements();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.textBlock, this.uploaderEl);

            return rendered;
        });
    }

    private initElements(): void {
        this.textBlock = new SpanEl('text').setHtml(i18n('notify.archive.license.missing'));
        this.uploaderEl = new ArchiveLicenseUploadEl();
    }
}
