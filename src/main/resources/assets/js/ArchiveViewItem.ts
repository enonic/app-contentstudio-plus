import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ViewItem} from 'lib-admin-ui/app/view/ViewItem';

export abstract class ArchiveViewItem implements ViewItem {

    protected constructor(builder: ArchiveViewItemBuilder) {
    //
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

    abstract getId(): string;

    abstract getDisplayName(): string;

    abstract getIconClass();

    abstract getIconUrl();

    abstract hasChildren(): boolean;
}

export abstract class ArchiveViewItemBuilder {

    constructor(source?: ArchiveViewItem) {
        return;
    }

    abstract build(): ArchiveViewItem;
}
