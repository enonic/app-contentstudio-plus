import {ArchiveViewItem, ArchiveViewItemBuilder} from './ArchiveViewItem';
import {i18n} from 'lib-admin-ui/util/Messages';

export class ArchiveBundleViewItem extends ArchiveViewItem {

    private readonly bundleId: string;

    private readonly archiveTime: Date;

    constructor(builder: ArchiveBundleViewItemBuilder) {
        super(builder);

        this.bundleId = builder.bundleId;
        this.archiveTime = builder.archiveTime;
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

}

export class ArchiveBundleViewItemBuilder extends ArchiveViewItemBuilder {

    bundleId: string;

    archiveTime: Date;

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

    build(): ArchiveBundleViewItem {
        return new ArchiveBundleViewItem(this);
    }

}
