import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveItemPreviewPanel} from './ArchiveItemPreviewPanel';
import {ArchiveViewItem} from './ArchiveViewItem';
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

    setItem(item: ArchiveViewItem) {
        if (ObjectHelper.equals(this.getItem(), item)) {
            return;
        }

        if (ObjectHelper.iFrameSafeInstanceOf(item, ArchiveContentViewItem)) {
            super.setItem(item);
            this.previewPanel.setItem((<ArchiveContentViewItem>item).getData());
        } else {
            this.clearItem();
        }
    }

    clearItem() {
        super.clearItem();

        this.previewPanel.clearItem();
    }
}
