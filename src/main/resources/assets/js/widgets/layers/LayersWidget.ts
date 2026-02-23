import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import {LayersWidgetItemView} from './LayersWidgetItemView';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class LayersWidget
    extends Widget {

    constructor(contentId: string) {
        super(contentId, AppHelper.getLayersWidgetClass());
    }

    protected renderWidgetContents(): void {
        this.fetchAndProcessContent();
    }

    protected processContent(content: ContentSummaryAndCompareStatus): void {
        const layersWidgetItemView: LayersWidgetItemView = LayersWidgetItemView.get();
        layersWidgetItemView.setContentAndUpdateView(content);
        this.appendChild(layersWidgetItemView);
    }
}
