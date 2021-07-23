import { CompareStatus } from 'lib-contentstudio/app/content/CompareStatus';
import { ContentPath } from 'lib-contentstudio/app/content/ContentPath';
import {ContentSummary, ContentSummaryBuilder } from 'lib-contentstudio/app/content/ContentSummary';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class ArchivedItem extends ContentSummaryAndCompareStatus {

    getPath(): ContentPath {
        return new ContentPath(super.getPath().getElements().slice(2));
    }

    clone(): ContentSummaryAndCompareStatus {
        const contentSummary: ContentSummary = new ContentSummaryBuilder(this.getContentSummary()).build();

        return new ArchivedItem()
            .setContentSummary(contentSummary)
            .setRenderable(this.isRenderable())
            .setCompareStatus(CompareStatus.ARCHIVED);
    }
}
