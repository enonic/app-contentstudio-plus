import {ArchiveViewItem, ArchiveViewItemBuilder} from './ArchiveViewItem';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Principal} from 'lib-admin-ui/security/Principal';

export class ArchiveBundleViewItem extends ArchiveViewItem {

    private readonly archivedBy: Principal;

    constructor(builder: ArchiveBundleViewItemBuilder) {
        super(builder);

        this.archivedBy = builder.archivedBy;
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

    hasChildren(): boolean {
        return true;
    }

    getArchiveTime(): Date {
        return this.data.getContentSummary().getCreatedTime();
    }

    getArchivedBy(): Principal {
        return this.archivedBy;
    }

}

export class ArchiveBundleViewItemBuilder extends ArchiveViewItemBuilder {

    archivedBy: Principal;

    setArchivedBy(value: Principal): ArchiveBundleViewItemBuilder {
        this.archivedBy = value;
        return this;
    }

    build(): ArchiveBundleViewItem {
        return new ArchiveBundleViewItem(this);
    }

}
