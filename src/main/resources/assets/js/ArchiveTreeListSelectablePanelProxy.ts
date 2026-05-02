import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {type ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {type SelectableListBoxWrapper, SelectionMode} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {type DataChangedEvent} from '@enonic/lib-admin-ui/ui/treegrid/DataChangedEvent';
import {type SelectionChange} from '@enonic/lib-admin-ui/util/SelectionChange';
import Q from 'q';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {$archiveListState, getArchiveItem} from './v6/features/store/archive-list';
import {getCurrentItems} from './v6/features/store/archive-selection';
import {ArchiveTreeListElement} from './v6/features/views/browse/archive/ArchiveTreeListElement';
import {ArchiveTreeListToolbarElement} from './v6/features/views/browse/archive/ArchiveTreeListToolbar';

export class ArchiveTreeListSelectablePanelProxy extends SelectableListBoxPanel<ArchiveContentViewItem> {

    private readonly archiveTreeList: ArchiveTreeListElement;

    private readonly treeListToolbar: ArchiveTreeListToolbarElement;

    constructor(
        listBoxWrapper: SelectableListBoxWrapper<ArchiveContentViewItem>,
        archiveTreeList: ArchiveTreeListElement,
        toolbar: ListBoxToolbar<ArchiveContentViewItem>,
    ) {
        super(listBoxWrapper, toolbar);
        this.archiveTreeList = archiveTreeList;
        this.treeListToolbar = new ArchiveTreeListToolbarElement();
    }

    onDataChanged(listener: (event: DataChangedEvent<ArchiveContentViewItem>) => void): void {
        this.listBoxWrapper.onDataChanged(listener);
    }

    onSelectionChanged(listener: (change: SelectionChange<ArchiveContentViewItem>) => void): void {
        this.archiveTreeList.onSelectionChanged(listener);
    }

    getSelectedItems(): ArchiveContentViewItem[] {
        return [...getCurrentItems()];
    }

    getLastSelectedItem(): ArchiveContentViewItem | undefined {
        return this.getSelectedItems().at(-1);
    }

    getSelectionMode(): SelectionMode {
        return SelectionMode.SELECT;
    }

    doRender(): Q.Promise<boolean> {
        this.addClass('selectable-list-box-panel flex flex-col');
        this.appendChild(this.treeListToolbar);
        this.appendChild(this.archiveTreeList);
        return Q(true);
    }

    getItem(id: string): ArchiveContentViewItem | undefined {
        return getArchiveItem(id);
    }

    getWrapper(): SelectableListBoxWrapper<ArchiveContentViewItem> {
        return this.listBoxWrapper;
    }

    getToolbar(): ListBoxToolbar<ArchiveContentViewItem> {
        return this.listToolbar;
    }

    getTotalItems(): number {
        return $archiveListState.get().items.length;
    }
}
