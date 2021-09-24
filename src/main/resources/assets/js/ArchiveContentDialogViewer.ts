import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';

export class ArchiveContentDialogViewer extends ContentSummaryAndCompareStatusViewer {

    constructor() {
        super();

        this.setIsRelativePath(true);
        this.addClass('archive-content-dialog-viewer');
    }

    resolveSubName(object: ContentSummaryAndCompareStatus): string {
        return object.getPath().toString();
    }
}
