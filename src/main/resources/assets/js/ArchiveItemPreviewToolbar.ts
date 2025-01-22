import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentItemPreviewToolbar} from 'lib-contentstudio/app/view/ContentItemPreviewToolbar';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {PreviewActionHelper} from 'lib-contentstudio/app/action/PreviewActionHelper';

export class ArchiveItemPreviewToolbar
    extends ContentItemPreviewToolbar {

    constructor(previewHelper: PreviewActionHelper) {
        super(previewHelper);

        this.addClass('archive-item-preview-toolbar');
    }

    protected updateStatus(content: ContentSummaryAndCompareStatus): void {
        this.status.setHtml(i18n('status.archived')); // for now just archived
    }
}
