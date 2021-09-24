import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveItemPreviewPanel} from './ArchiveItemPreviewPanel';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';

export class ArchiveItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly previewPanel: ArchiveItemPreviewPanel;

    constructor() {
        super('content-item-statistics-panel');

        this.previewPanel = new ArchiveItemPreviewPanel(ArchiveResourceRequest.ARCHIVE_PATH);
        this.previewPanel.setDoOffset(false);
        this.appendChild(this.previewPanel);
    }

    setItem(item: ArchiveViewItem) {
        if (ObjectHelper.equals(this.getItem(), item)) {
            return;
        }

        this.previewPanel.setItem((<ArchiveContentViewItem>item).getData());
    }

    clearItem() {
        super.clearItem();

        this.previewPanel.clearItem();
    }
}
