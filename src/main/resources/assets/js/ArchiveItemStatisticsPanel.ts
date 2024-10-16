import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ArchiveItemPreviewPanel} from './ArchiveItemPreviewPanel';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';

export class ArchiveItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly previewPanel: ArchiveItemPreviewPanel;

    constructor() {
        super('content-item-statistics-panel');

        this.previewPanel = new ArchiveItemPreviewPanel();
        this.previewPanel.setDoOffset(false);
        this.appendChild(this.previewPanel);
    }

    setItem(item: ArchiveContentViewItem): void {
        if (ObjectHelper.equals(this.getItem(), item)) {
            return;
        }

        this.previewPanel.setItem(item);
    }

    clearItem(): void {
        super.clearItem();

        this.previewPanel.clearItem();
    }
}
