import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ArchiveViewItem, ArchiveViewItemBuilder} from './ArchiveViewItem';
import {i18n} from 'lib-admin-ui/util/Messages';

export class ArchiveBundleViewItem extends ArchiveViewItem {

    private readonly bundleId: string;

    private readonly archiveTime: Date;

    private readonly contentIds: ContentId[];

    constructor(builder: ArchiveBundleViewItemBuilder) {
        super(builder);

        this.bundleId = builder.bundleId;
        this.archiveTime = builder.archiveTime;
        this.contentIds = builder.contentIds;
    }

    getDisplayName(): string {
        return i18n('status.archived');
    }

    getIconClass() {
        return 'icon-archive';
    }

    getIconUrl() {
        return null;
    }

    getId(): string {
        return this.bundleId;
    }

    hasChildren(): boolean {
        return true;
    }

    getArchiveTime(): Date {
        return this.archiveTime;
    }

    getContentIds(): ContentId[] {
        return this.contentIds;
    }

}

export class ArchiveBundleViewItemBuilder extends ArchiveViewItemBuilder {

    bundleId: string;

    archiveTime: Date;

    contentIds: ContentId[];

    setBundleId(value: string): ArchiveBundleViewItemBuilder {
        this.bundleId = value;
        return this;
    }

    setArchiveTime(archiveTime: Date): ArchiveBundleViewItemBuilder {
        this.archiveTime = archiveTime;
        return this;
    }

    setArchiveTimeAsString(archiveTimeAsString: string): ArchiveBundleViewItemBuilder {
        this.archiveTime = new Date(Date.parse(archiveTimeAsString));
        return this;
    }

    setContentIdsAsStrings(values: string[]): ArchiveBundleViewItemBuilder {
        this.contentIds = values.map((value: string) => new ContentId(value));
        return this;
    }

    setContentIds(value: ContentId[]): ArchiveBundleViewItemBuilder {
        this.contentIds = value;
        return this;
    }

    build(): ArchiveBundleViewItem {
        return new ArchiveBundleViewItem(this);
    }

}
