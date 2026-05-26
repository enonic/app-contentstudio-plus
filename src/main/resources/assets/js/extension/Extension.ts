import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {NoLicenseBannerElement} from '../v6/features/shared/license/NoLicenseBanner';
import {AppHelper} from '../util/AppHelper';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import Q from 'q';
import {HasValidLicenseRequest} from '../resource/HasValidLicenseRequest';
import {Element} from '@enonic/lib-admin-ui/dom/Element';

const DARK_CLASS = 'dark';

export class Extension
    extends DivEl {

    protected contentId?: string;
    private noItemsBlock?: Element;
    private themeObserver?: MutationObserver;

    constructor(contentId: string, cls?: string) {
        super(`${AppHelper.getCommonExtensionClass()}${cls ? ` ${cls}` : ''}`);

        this.setContentId(contentId);
        this.syncTheme();
        this.observeOuterTheme();

        this.hasLicenseValid().then((isValid: boolean) => {
            if (isValid) {
                this.renderWidget();
            } else {
                this.renderNoLicense();
            }
        }).catch(DefaultErrorHandler.handle);
    }

    private syncTheme(): void {
        const isDark = document.documentElement.classList.contains(DARK_CLASS);

        this.getHTMLElement().classList.toggle(DARK_CLASS, isDark);

        const root = this.getHTMLElement().getRootNode();
        if (root instanceof ShadowRoot) {
            root.host.classList.toggle(DARK_CLASS, isDark);
        }
    }

    private observeOuterTheme(): void {
        this.themeObserver?.disconnect();
        this.themeObserver = new MutationObserver(() => this.syncTheme());
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
    }

    setContentId(contentId: string): void {
        this.contentId = contentId;
        this.noItemsBlock?.hide();
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

        this.renderExtensionContents();
    }

    protected renderExtensionContents(): void {
        //
    }

    private renderNoLicense(): void {
        this.appendChild(new NoLicenseBannerElement());
    }

    cleanUp(): void {
        this.themeObserver?.disconnect();
        this.themeObserver = undefined;
    }

    static getContainer(el: Element): Element {
        const widgetClass = AppHelper.getCommonExtensionContainerClass();
        let container = el.getParentElement();

        while (container != null && !container.hasClass(widgetClass)) {
            container = container.getParentElement();
        }
        return container;
    }
}
