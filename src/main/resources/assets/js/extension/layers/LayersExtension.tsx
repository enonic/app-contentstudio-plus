import {IdProvider} from '@enonic/ui';
import {render, unmountComponentAtNode} from 'react-dom';
import {AppHelper} from '../../util/AppHelper';
import {LayersWidget} from '../../v6/features/views/context/widget/layers/LayersWidget';
import {Extension} from '../Extension';

const DARK_CLASS = 'dark';

export class LayersExtension
    extends Extension {

    private themeObserver?: MutationObserver;

    private reactRoot?: HTMLElement;

    constructor(contentId: string) {
        super(contentId, AppHelper.getLayersExtensionClass());
    }

    protected renderExtensionContents(): void {
        this.syncTheme();
        this.observeOuterTheme();

        this.reactRoot = document.createElement('div');
        this.reactRoot.className = 'contents';
        this.getHTMLElement().appendChild(this.reactRoot);

        render(
            <IdProvider prefix="LayersWidget">
                <LayersWidget contentId={this.contentId} />
            </IdProvider>,
            this.reactRoot,
        );
    }

    cleanUp(): void {
        super.cleanUp();
        this.themeObserver?.disconnect();
        this.themeObserver = undefined;

        if (this.reactRoot) {
            unmountComponentAtNode(this.reactRoot);
            this.reactRoot.remove();
            this.reactRoot = undefined;
        }
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
}
