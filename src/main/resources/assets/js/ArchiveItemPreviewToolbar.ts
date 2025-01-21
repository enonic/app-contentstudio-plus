import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentItemPreviewToolbar} from 'lib-contentstudio/app/view/ContentItemPreviewToolbar';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class ArchiveItemPreviewToolbar
    extends ContentItemPreviewToolbar {

    constructor() {
        super();

        this.addClass('archive-item-preview-toolbar');
    }

    isArchive(): boolean {
        return true;
    }

    protected updateStatus(content: ContentSummaryAndCompareStatus): void {
        this.status.setHtml(i18n('status.archived')); // for now just archived
    }
}
