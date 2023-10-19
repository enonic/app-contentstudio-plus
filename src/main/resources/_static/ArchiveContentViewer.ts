import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';

export class ArchiveContentViewer extends ContentSummaryAndCompareStatusViewer {

    constructor() {
        super();

        this.addClass('archive-content-viewer');
        this.setIsRelativePath(true);
    }

    resolveWorkflowState(): string {
        return '';
    }
}
