import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentItemPreviewToolbar} from '@enonic/lib-contentstudio/app/view/ContentItemPreviewToolbar';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {PreviewActionHelper} from '@enonic/lib-contentstudio/app/action/PreviewActionHelper';

export class ArchiveItemPreviewToolbar
    extends ContentItemPreviewToolbar {

    constructor() {
        super();

        this.addClass('archive-item-preview-toolbar');
    }

    protected updateStatus(content: ContentSummaryAndCompareStatus): void {
        this.status.setHtml(i18n('status.archived')); // for now just archived
    }
}
