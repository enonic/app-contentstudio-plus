import { SpanEl } from "lib-admin-ui/dom/SpanEl";
import { DateTimeFormatter } from "lib-admin-ui/ui/treegrid/DateTimeFormatter";
import { ContentSummaryAndCompareStatus } from "lib-contentstudio/app/content/ContentSummaryAndCompareStatus";
import {ContentStatusToolbar} from "lib-contentstudio/app/ContentStatusToolbar";

export class ArchiveItemPreviewToolbar extends ContentStatusToolbar {

    private whenArchived: SpanEl;

    constructor() {
        super('archive-status-toolbar');

        this.whenArchived = new SpanEl('when');
        this.whenArchived.insertAfterEl(this.status);
    }

    setItem(item: ContentSummaryAndCompareStatus): void {
        super.setItem(item);

        if (item) {
            this.whenArchived.setHtml(DateTimeFormatter.createHtmlNoTimestamp(item.getContentSummary().getModifiedTime()));
        }
    }

}