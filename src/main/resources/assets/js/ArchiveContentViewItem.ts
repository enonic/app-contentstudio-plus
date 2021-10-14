import {ArchiveViewItem, ArchiveViewItemBuilder} from './ArchiveViewItem';
import {ContentIconUrlResolver} from 'lib-contentstudio/app/content/ContentIconUrlResolver';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';

export class ArchiveContentViewItem
    extends ArchiveViewItem {

    private readonly originalParentPath: string;

    constructor(builder: ArchiveContentViewItemBuilder) {
        super(builder);

        this.originalParentPath = builder.originalParentPath;
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

    hasChildren(): boolean {
        return this.data.hasChildren();
    }

    getOriginalParentPath(): string {
        return this.originalParentPath;
    }

    getOriginalFullPath(): string {
        if (this.data.getPath().getLevel() === 1) {
            return this.originalParentPath;
        }

        return this.originalParentPath + ContentPath.NODE_PATH_DIVIDER +
               this.data.getPath().getElements().slice(1).join(ContentPath.NODE_PATH_DIVIDER);
    }

}

export class ArchiveContentViewItemBuilder
    extends ArchiveViewItemBuilder {

    originalParentPath: string;

    setOriginalParentPath(value: string): ArchiveContentViewItemBuilder {
        this.originalParentPath = value;
        return this;
    }

    setData(value: ContentSummaryAndCompareStatus): ArchiveContentViewItemBuilder {
        return <ArchiveContentViewItemBuilder>super.setData(value);
    }

    build(): ArchiveContentViewItem {
        return new ArchiveContentViewItem(this);
    }

}
