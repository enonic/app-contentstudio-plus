import {ArchiveViewItem, ArchiveViewItemBuilder} from './ArchiveViewItem';
import {ContentIconUrlResolver} from 'lib-contentstudio/app/content/ContentIconUrlResolver';

export class ArchiveContentViewItem extends ArchiveViewItem {

    constructor(builder: ArchiveContentViewItemBuilder) {
        super(builder);
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

}

export class ArchiveContentViewItemBuilder extends ArchiveViewItemBuilder {

    build(): ArchiveContentViewItem {
        return new ArchiveContentViewItem(this);
    }

}
