import {ArchiveItemPreviewToolbar} from './ArchiveItemPreviewToolbar';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {ExtensionRenderingHandler} from '@enonic/lib-contentstudio/app/view/ExtensionRenderingHandler';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ContentItemPreviewPanel} from '@enonic/lib-contentstudio/app/view/ContentItemPreviewPanel';
import {PreviewActionHelper} from '@enonic/lib-contentstudio/app/action/PreviewActionHelper';

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

    protected createExtensionRenderingHandler(): ExtensionRenderingHandler {
        return new ExtensionRenderingHandler(this, new PreviewActionHelper({archive: "true"}));
    }
}
