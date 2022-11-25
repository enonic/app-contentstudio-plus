import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';
import {AppHelper} from '../util/AppHelper';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import * as Q from 'q';
import {HasValidLicenseRequest} from '../resource/HasValidLicenseRequest';
import {Element} from '@enonic/lib-admin-ui/dom/Element';

export class Widget
    extends DivEl {

    protected contentId?: string;
    protected readonly loadMask: LoadMask;
    private noItemsBlock?: Element;

    constructor(cls?: string) {
        super(AppHelper.getCommonWidgetClass() + (' ' + cls || ''));

        this.loadMask = new LoadMask(this);
    }

    setContentId(contentId: string): void {
        this.contentId = contentId;
        this.noItemsBlock?.hide();
    }

    protected handleNoSelectedItem(): void {
        if (!this.noItemsBlock) {
            this.noItemsBlock = new SpanEl('error').setHtml(i18n('notify.archive.widget.noselection'));
            this.appendChild(this.noItemsBlock);
        }

        this.noItemsBlock.show();
    }

    protected hasLicenseValid(): Q.Promise<boolean> {
        return new HasValidLicenseRequest().sendAndParse();
    }
}
