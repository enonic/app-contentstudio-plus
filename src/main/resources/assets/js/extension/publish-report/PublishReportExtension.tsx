import {IdProvider} from '@enonic/ui';
import {render, unmountComponentAtNode} from 'react-dom';
import {AppHelper} from '../../util/AppHelper';
import {PublishReportWidget} from '../../v6/features/views/context/widget/publish-report/PublishReportWidget';
import {Extension} from '../Extension';

export class PublishReportExtension
    extends Extension {

    private readonly firstPublishedRaw: string;

    private readonly isContentArchived: boolean;

    private reactRoot?: HTMLElement;

    constructor(contentId: string, firstPublished: string, isArchived: boolean) {
        super(contentId, AppHelper.getPublishReportExtensionClass());

        this.firstPublishedRaw = firstPublished;
        this.isContentArchived = isArchived;
    }

    protected renderExtensionContents(): void {
        const parsed = this.firstPublishedRaw ? new Date(this.firstPublishedRaw) : null;
        const firstPublished = parsed && !isNaN(parsed.getTime()) ? parsed : null;

        this.reactRoot = document.createElement('div');
        this.reactRoot.className = 'contents';
        this.getHTMLElement().appendChild(this.reactRoot);

        render(
            <IdProvider prefix="PublishReportWidget">
                <PublishReportWidget
                    contentId={this.contentId}
                    firstPublished={firstPublished}
                    isArchived={this.isContentArchived}
                    injected
                />
            </IdProvider>,
            this.reactRoot,
        );
    }

    cleanUp(): void {
        super.cleanUp();

        if (this.reactRoot) {
            unmountComponentAtNode(this.reactRoot);
            this.reactRoot.remove();
            this.reactRoot = undefined;
        }
    }
}
