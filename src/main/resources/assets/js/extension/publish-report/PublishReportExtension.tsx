import {IdProvider} from '@enonic/ui';
import {render} from 'react-dom';
import {AppHelper} from '../../util/AppHelper';
import {PublishReportWidget} from '../../v6/features/views/context/widget/publish-report/PublishReportWidget';
import {Extension} from '../Extension';

const DARK_CLASS = 'dark';

export class PublishReportExtension
    extends Extension {

    private readonly firstPublishedRaw: string;

    private readonly isContentArchived: boolean;

    private themeObserver?: MutationObserver;

    constructor(contentId: string, firstPublished: string, isArchived: boolean) {
        super(contentId, AppHelper.getPublishReportExtensionClass());

        this.firstPublishedRaw = firstPublished;
        this.isContentArchived = isArchived;
    }

    protected renderExtensionContents(): void {
        this.syncTheme();
        this.observeOuterTheme();

        const parsed = this.firstPublishedRaw ? new Date(this.firstPublishedRaw) : null;
        const firstPublished = parsed && !isNaN(parsed.getTime()) ? parsed : null;

        const reactRoot = document.createElement('div');
        reactRoot.className = 'contents';
        this.getHTMLElement().appendChild(reactRoot);

        render(
            <IdProvider prefix="PublishReportWidget">
                <PublishReportWidget
                    contentId={this.contentId}
                    firstPublished={firstPublished}
                    isArchived={this.isContentArchived}
                />
            </IdProvider>,
            reactRoot,
        );
    }

    cleanUp(): void {
        super.cleanUp();
        this.themeObserver?.disconnect();
        this.themeObserver = undefined;
    }

    private syncTheme(): void {
        const isDark = document.documentElement.classList.contains(DARK_CLASS);

        // Toggle on our wrapper (covers descendants of this element).
        this.getHTMLElement().classList.toggle(DARK_CLASS, isDark);

        // When loaded as a custom-element with shadow DOM (CS context),
        // also toggle on the shadow host so `:host(.dark)` activates dark
        // tokens at the shadow-root level — this covers anything inside
        // the shadow root, including portaled popups that don't end up
        // as descendants of our wrapper.
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
