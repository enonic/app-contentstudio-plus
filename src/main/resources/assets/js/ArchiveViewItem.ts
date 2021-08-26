import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ViewItem} from 'lib-admin-ui/app/view/ViewItem';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export abstract class ArchiveViewItem implements ViewItem {

    protected readonly data: ContentSummaryAndCompareStatus;

    protected constructor(builder: ArchiveViewItemBuilder) {
        this.data = builder.data;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, ArchiveViewItem)) {
            return false;
        }

        const other: ArchiveViewItem = <ArchiveViewItem>o;

        if (!ObjectHelper.stringEquals(this.getId(), other.getId())) {
            return false;
        }

        if (!ObjectHelper.stringEquals(this.getDisplayName(), other.getDisplayName())) {
            return false;
        }

        if (!ObjectHelper.stringEquals(this.getIconClass(), other.getIconClass())) {
            return false;
        }

        if (!ObjectHelper.stringEquals(this.getIconUrl(), other.getIconUrl())) {
            return false;
        }

        return true;
    }

    getId(): string {
        return this.data.getContentSummary()?.getId();
    }

    abstract getDisplayName(): string;

    abstract getIconClass();

    abstract getIconUrl();

    abstract hasChildren(): boolean;

    getData(): ContentSummaryAndCompareStatus {
        return this.data;
    }
}

export abstract class ArchiveViewItemBuilder {

    data: ContentSummaryAndCompareStatus;

    constructor(source?: ArchiveViewItem) {
        return;
    }

    setData(value: ContentSummaryAndCompareStatus): ArchiveViewItemBuilder {
        this.data = value;
        return this;
    }

    abstract build(): ArchiveViewItem;
}
