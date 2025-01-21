import {ArchiveItemPreviewToolbar} from './ArchiveItemPreviewToolbar';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ContentItemPreviewPanel} from 'lib-contentstudio/app/view/ContentItemPreviewPanel';

export class ArchiveItemPreviewPanel
    extends ContentItemPreviewPanel {

    protected item: ArchiveContentViewItem;

    constructor() {
        super(ContentPath.ARCHIVE_ROOT);

        this.addClass('archive-item-preview-panel');
    }

    createToolbar(): ArchiveItemPreviewToolbar {
        return new ArchiveItemPreviewToolbar();
    }
}
