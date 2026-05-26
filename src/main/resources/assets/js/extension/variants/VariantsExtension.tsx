import {IdProvider} from '@enonic/ui';
import {render, unmountComponentAtNode} from 'react-dom';
import {AppHelper} from '../../util/AppHelper';
import {VariantsWidget} from '../../v6/features/views/context/widget/variants/VariantsWidget';
import {Extension} from '../Extension';

export class VariantsExtension
    extends Extension {

    private reactRoot?: HTMLElement;

    constructor(contentId: string) {
        super(contentId, AppHelper.getVariantsExtensionClass());
    }

    protected renderExtensionContents(): void {
        this.reactRoot = document.createElement('div');
        this.reactRoot.className = 'contents';
        this.getHTMLElement().appendChild(this.reactRoot);

        render(
            <IdProvider prefix="VariantsWidget">
                <VariantsWidget contentId={this.contentId} />
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
