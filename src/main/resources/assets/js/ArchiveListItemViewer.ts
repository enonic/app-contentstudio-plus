import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ArchiveContentViewer} from './ArchiveContentViewer';
import * as Q from 'q';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';

export class ArchiveListItemViewer extends DivEl {

    private readonly dataBlock: ArchiveContentViewer;

    private readonly statusViewer: DivEl;

    private readonly statusViewerEl: SpanEl;

    constructor() {
        super('archive-list-item-viewer');

        this.dataBlock = new ArchiveContentViewer();
        this.statusViewer = new DivEl('status-viewer');
        this.statusViewerEl = new SpanEl('status-viewer-text');
    }

    setItem(item: ArchiveContentViewItem) {
        this.dataBlock.setObject(item);
        this.statusViewerEl.setHtml(i18n('status.archived')); // for now just archived
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.statusViewer.appendChild(this.statusViewerEl);
            this.appendChild(this.dataBlock);
            this.appendChild(this.statusViewer);

            return rendered;
        });
    }

}