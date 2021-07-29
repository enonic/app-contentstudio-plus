import {ContentItemPreviewPanel} from 'lib-contentstudio/app/view/ContentItemPreviewPanel';
import {ContentItemPreviewToolbar} from 'lib-contentstudio/app/view/ContentItemPreviewToolbar';
import {ArchiveItemPreviewToolbar} from './ArchiveItemPreviewToolbar';

export class ArchiveItemPreviewPanel
    extends ContentItemPreviewPanel {

    createToolbar(): ContentItemPreviewToolbar {
        return <any>new ArchiveItemPreviewToolbar();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.addClass('archive-item-preview-panel');

            return rendered;
        });
    }
}
