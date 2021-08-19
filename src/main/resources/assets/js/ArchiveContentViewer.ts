import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class ArchiveContentViewer extends ContentSummaryAndCompareStatusViewer {

    constructor() {
        super();

        this.setIsRelativePath(true);
    }
    resolveSubName(object: ContentSummaryAndCompareStatus): string {
        return super.resolveSubName(object);
    }
}
