import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {LoadMask} from '@enonic/lib-admin-ui/ui/mask/LoadMask';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from '@enonic/lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ArchiveNoLicenseBlock} from '../ArchiveNoLicenseBlock';
import {AppHelper} from '../util/AppHelper';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import Q from 'q';
import {HasValidLicenseRequest} from '../resource/HasValidLicenseRequest';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';

export class Widget
    extends DivEl {

    protected contentId?: string;
    protected loadMask: LoadMask;
    private noItemsBlock?: Element;

    constructor(contentId: string, cls?: string) {
        super(AppHelper.getCommonWidgetClass() + (' ' + cls || ''));

        this.setContentId(contentId);
        this.initElements();
        this.initListeners();

        this.hasLicenseValid().then((isValid: boolean) => {
            if (isValid) {
                this.renderWidget();
            } else {
                this.renderNoLicense();
            }
        }).catch(DefaultErrorHandler.handle);
    }

    setContentId(contentId: string): void {
        this.contentId = contentId;
        this.noItemsBlock?.hide();
    }

    protected initElements(): void {
        this.loadMask = new LoadMask(this);
    }

    protected fetchAndProcessContent(contentId?: string, handler?: (content: ContentSummaryAndCompareStatus) => void): Q.Promise<void> {
        this.loadMask.show();
        return new ContentSummaryAndCompareStatusFetcher()
            .fetch(new ContentId(contentId || this.contentId))
            .then((content: ContentSummaryAndCompareStatus) =>
                ObjectHelper.isDefined(handler) ? handler(content) : this.processContent(content)
            )
            .finally(() => this.loadMask.hide())
            .catch(DefaultErrorHandler.handle);
    }

    protected processContent(_content: ContentSummaryAndCompareStatus): Q.Promise<void> | void {
        return Q.resolve();
    }

    protected initListeners(): void {
        //
    }

    protected handleNoSelectedItem(): void {
        if (!this.noItemsBlock) {
            this.noItemsBlock = new SpanEl('error').setHtml(i18n('field.contextPanel.empty'));
            this.appendChild(this.noItemsBlock);
        }

        this.noItemsBlock.show();
    }

    protected hasLicenseValid(): Q.Promise<boolean> {
        return new HasValidLicenseRequest().sendAndParse();
    }

    protected renderWidget(): void {
        if (!this.contentId) {
            this.handleNoSelectedItem();
            return;
        }

        this.renderWidgetContents();
    }

    protected renderWidgetContents(): void {
        //
    }

    private renderNoLicense(): void {
        this.appendChild(new ArchiveNoLicenseBlock());
    }

    cleanUp(): void {
        //
    }

    static getContainer(el: Element): Element {
        const widgetClass = AppHelper.getCommonWidgetContainerClass();
        let container = el.getParentElement();

        while (container != null && !container.hasClass(widgetClass)) {
            container = container.getParentElement();
        }
        return container;
    }
}
