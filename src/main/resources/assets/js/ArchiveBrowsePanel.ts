import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import Q from 'q';
import {ArchiveContextView} from './ArchiveContextView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ResponsiveBrowsePanel} from 'lib-contentstudio/app/browse/ResponsiveBrowsePanel';
import {ArchiveFilterPanel} from './ArchiveFilterPanel';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';
import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';
import {ArchiveTreeGridActions} from './ArchiveTreeGridActions';
import {TreeGridContextMenu} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {SelectableTreeListBoxKeyNavigator} from '@enonic/lib-admin-ui/ui/selector/list/SelectableTreeListBoxKeyNavigator';
import {ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {ArchiveTreeRootList} from './ArchiveTreeRootList';
import {ArchiveServerEvent} from 'lib-contentstudio/app/event/ArchiveServerEvent';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {ContentServerChangeItem} from 'lib-contentstudio/app/event/ContentServerChangeItem';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {ArchiveHelper} from './ArchiveHelper';
import {ArchiveTreeListElement} from './ArchiveTreeList';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';

export class ArchiveBrowsePanel
    extends ResponsiveBrowsePanel {

    protected treeListBox: ArchiveTreeRootList;

    protected treeActions: ArchiveTreeGridActions;

    protected toolbar: ListBoxToolbar<ArchiveContentViewItem>;

    protected contextMenu: TreeGridContextMenu;

    protected selectionWrapper: SelectableListBoxWrapper<ArchiveContentViewItem>;

    protected contextView: ArchiveContextView;

    protected filterPanel: ArchiveFilterPanel;

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-browse-panel');

            return rendered;
        });
    }

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addClass('content-browse-toolbar');
        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
        this.browseToolbar.appendChild(this.contextSplitPanelToggler);
    }

    protected initListeners(): void {
        super.initListeners();

        this.filterPanel.onSearchEvent((query?: ContentQuery) => {
            this.treeListBox.setFilterQuery(query);
        });

        this.treeListBox.onItemsAdded((items: ArchiveContentViewItem[], itemViews: ArchiveTreeListElement[]) => {
            items.forEach((item: ArchiveContentViewItem, index) => {
                const listElement = itemViews[index]?.getDataView();

                listElement?.onContextMenu((event: MouseEvent) => {
                    event.preventDefault();
                    this.contextMenu.showAt(event.clientX, event.clientY);
                });
            });
        });

        ArchiveServerEvent.on((event: ArchiveServerEvent) => {
            const type: NodeServerChangeType = event.getNodeChange().getChangeType();

            if (type === NodeServerChangeType.MOVE || type === NodeServerChangeType.DELETE) {
                const itemsToRemove: ContentServerChangeItem[] =
                    ArchiveHelper.filterTopMostItems(event.getNodeChange().getChangeItems()) as ContentServerChangeItem[];
                const itemsToRemoveIds: string[] = itemsToRemove.map((item: ContentServerChangeItem) => item.getContentId().toString());

                const itemsFound = this.treeListBox.getItems(true).filter((item: ArchiveContentViewItem) => {
                    return itemsToRemoveIds.some((id: string) => id === item.getId());
                });

                this.selectionWrapper.deselect(itemsFound);

                itemsFound.forEach((item: ArchiveContentViewItem) => {
                    const listElement = this.treeListBox.getItemView(item) as ArchiveTreeListElement;
                    listElement.getParentList().removeItems(item);
                });
            }
        });

        let isRefreshTriggered = false;

        const refreshHandler = (): void => {
            isRefreshTriggered = false;
            this.selectionWrapper.deselectAll();
            void this.treeListBox.load();
        };

        ContentServerEventsHandler.getInstance().onContentArchived((items: ContentServerChangeItem[]) => {
            if (items.some((item) => item.getRepo()?.split('.').pop() === ProjectContext.get().getProject().getName())) {
                if (!isRefreshTriggered) {
                    isRefreshTriggered = true;

                    this.whenShown(refreshHandler);
                }
            }
        });

        ProjectContext.get().onProjectChanged(() => {
            if (!isRefreshTriggered) {
                isRefreshTriggered = true;
                this.whenShown(refreshHandler);
            }
        });

        this.selectionWrapper.whenRendered(() => {
            this.treeListBox.load();
        });
    }

    protected updateContextView(item: ArchiveContentViewItem): Q.Promise<void> {
        this.contextView.setArchiveItem(item);
        return this.contextView.setItem(item);
    }

    protected createBrowseItemPanel(): BrowseItemPanel {
        return new ArchiveBrowseItemPanel();
    }

    protected createListBoxPanel(): SelectableListBoxPanel<ViewItem> {
        this.treeListBox = new ArchiveTreeRootList({scrollParent: this});

        this.selectionWrapper = new SelectableListBoxWrapper<ArchiveContentViewItem>(this.treeListBox, {
            className: 'archive-list-box-wrapper',
            maxSelected: 0,
            checkboxPosition: 'left',
            highlightMode: true,
        });

        this.toolbar = new ListBoxToolbar<ArchiveContentViewItem>(this.selectionWrapper, {
            refreshAction: () => this.treeListBox.load(),
        });

        this.treeActions = new ArchiveTreeGridActions();
        this.contextMenu = new TreeGridContextMenu(this.treeActions);

        const panel = new SelectableListBoxPanel(this.selectionWrapper, this.toolbar);
        panel.addClass('content-selectable-list-box-panel');

        return panel;
    }

    protected togglePreviewPanelDependingOnScreenSize(): void {
        //
    }

    protected createKeyNavigator() {
        return new SelectableTreeListBoxKeyNavigator(this.selectionWrapper);
    }

    protected createContextView(): ArchiveContextView {
        return new ArchiveContextView();
    }

    protected createFilterPanel(): ArchiveFilterPanel {
        return new ArchiveFilterPanel();
    }

    protected enableSelectionMode(): void {
        this.treeListBox.setSelectionMode(true);
        const selectedItems = this.selectableListBoxPanel.getSelectedItems() as ArchiveContentViewItem[];
        this.treeListBox.setItems(selectedItems);
    }

    protected disableSelectionMode(): void {
        this.treeListBox.reset();
        this.filterPanel.resetConstraints();
        this.hideFilterPanel();

    }
}
