import {IdProvider} from '@enonic/ui';
import {render, unmountComponentAtNode} from 'react-dom';
import {AppHelper} from '../../util/AppHelper';
import {LayersWidget} from '../../v6/features/views/context/widget/layers/LayersWidget';
import {Extension} from '../Extension';

export class LayersExtension
    extends Extension {

    private reactRoot?: HTMLElement;

    constructor(contentId: string) {
        super(contentId, AppHelper.getLayersExtensionClass());
    }

    protected renderExtensionContents(): void {
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

        if (this.reactRoot) {
            unmountComponentAtNode(this.reactRoot);
            this.reactRoot.remove();
            this.reactRoot = undefined;
        }
    }
}
