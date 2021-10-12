import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {DateTimeFormatter} from 'lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentStatusToolbar} from 'lib-contentstudio/app/ContentStatusToolbar';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DivEl} from 'lib-admin-ui/dom/DivEl';

export class ArchiveItemPreviewToolbar
    extends ContentStatusToolbar {

    private readonly archivedDate: SpanEl;

    private readonly originalPathEl: SpanEl;

    constructor() {
        super('archive-status-toolbar');

        this.archivedDate = new SpanEl('archived-date');
        this.archivedDate.insertAfterEl(this.status);

        const originalPathWrapper = new DivEl('original-path');
        this.originalPathEl = new SpanEl('original-path-value');
        originalPathWrapper.appendChildren(new SpanEl().setHtml(i18n('preview.originalPath')), this.originalPathEl);

        this.insertChild(originalPathWrapper, 1);
    }

    setItem(item: ContentSummaryAndCompareStatus): void {
        super.setItem(item);

        if (item) {
            this.status.setHtml(i18n('status.archived'));
            this.archivedDate.setHtml(DateTimeFormatter.createHtmlNoTimestamp(item.getContentSummary().getModifiedTime()));
            this.originalPathEl.setHtml(item.getPath().toString());
        }
    }

    clearItem(): void {
        super.clearItem();

        this.archivedDate.setHtml('');
    }

    protected foldOrExpand(): void {
        return;
    }
}
