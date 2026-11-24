import {ArchiveTreeList} from './ArchiveTreeList';

export class ArchiveTreeRootList extends ArchiveTreeList {

    private selectionMode: boolean;

    protected handleLazyLoad(): void {
        if (!this.selectionMode) {
            super.handleLazyLoad();
        }
    }

    reset(): void {
        this.selectionMode = false;
    }

    setSelectionMode(selectionMode: boolean): void {
        this.selectionMode = selectionMode;
    }

}
