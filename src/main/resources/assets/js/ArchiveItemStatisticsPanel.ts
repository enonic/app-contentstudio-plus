import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveItemPreviewPanel} from './ArchiveItemPreviewPanel';

export class ArchiveItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly previewPanel: ArchiveItemPreviewPanel;

    constructor() {
        super('content-item-statistics-panel');

        this.previewPanel = new ArchiveItemPreviewPanel();
        this.previewPanel.setDoOffset(false);
        this.appendChild(this.previewPanel);
    }

    setItem(item: ContentSummaryAndCompareStatus) {
        if (!ObjectHelper.equals(this.getItem(), item)) {
            super.setItem(item);
            this.previewPanel.setItem(item);
        }
    }

    clearItem() {
        super.clearItem();

        this.previewPanel.clearItem();
    }
}
