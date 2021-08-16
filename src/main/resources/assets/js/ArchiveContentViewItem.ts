import {ArchiveViewItem, ArchiveViewItemBuilder} from './ArchiveViewItem';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentIconUrlResolver} from 'lib-contentstudio/app/content/ContentIconUrlResolver';

export class ArchiveContentViewItem extends ArchiveViewItem {

    private readonly data: ContentSummaryAndCompareStatus;

    constructor(builder: ArchiveContentViewItemBuilder) {
        super(builder);

        this.data = builder.data;
    }

    getDisplayName(): string {
        return this.data.getContentSummary().getDisplayName();
    }

    getIconUrl(): string {
        return new ContentIconUrlResolver().setContent(this.data.getContentSummary()).resolve();
    }

    getIconClass(): string {
        return '';
    }

    getId(): string {
        return this.data.getContentSummary().getId();
    }

    hasChildren(): boolean {
        return this.data.hasChildren();
    }

    getData(): ContentSummaryAndCompareStatus {
        return this.data;
    }

}

export class ArchiveContentViewItemBuilder extends ArchiveViewItemBuilder {

    data: ContentSummaryAndCompareStatus;

    setData(value: ContentSummaryAndCompareStatus): ArchiveContentViewItemBuilder {
        this.data = value;
        return this;
    }

    build(): ArchiveContentViewItem {
        return new ArchiveContentViewItem(this);
    }

}
