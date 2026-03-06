import {Extension} from '../Extension';
import {AppHelper} from '../../util/AppHelper';
import {LayersExtensionItemView} from './LayersExtensionItemView';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class LayersExtension
    extends Extension {

    constructor(contentId: string) {
        super(contentId, AppHelper.getLayersExtensionClass());
    }

    protected renderExtensionContents(): void {
        this.fetchAndProcessContent();
    }

    protected processContent(content: ContentSummaryAndCompareStatus): void {
        const layersExtensionItemView: LayersExtensionItemView = LayersExtensionItemView.get();
        layersExtensionItemView.setContentAndUpdateView(content);
        this.appendChild(layersExtensionItemView);
    }
}
