import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';

export class ArchiveContentViewItem
    extends ContentSummaryAndCompareStatus {

    private readonly originalParentPath: string;

    constructor(originalParentPath: string) {
        super();

        this.originalParentPath = originalParentPath;
    }

    getOriginalParentPath(): string {
        return this.originalParentPath;
    }

    getOriginalFullPath(): string {
        if (this.getPath().getLevel() === 1) {
            return this.originalParentPath;
        }

        return this.originalParentPath + ContentPath.NODE_PATH_DIVIDER +
               this.getPath().getElements().slice(1).join(ContentPath.NODE_PATH_DIVIDER);
    }
}
