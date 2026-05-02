import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';
import {NodeServerChangeType} from '@enonic/lib-admin-ui/event/NodeServerChange';
import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {SelectableTreeListBoxKeyNavigator} from '@enonic/lib-admin-ui/ui/selector/list/SelectableTreeListBoxKeyNavigator';
import {ResponsiveBrowsePanel} from '@enonic/lib-contentstudio/app/browse/ResponsiveBrowsePanel';
import {ContentQuery} from '@enonic/lib-contentstudio/app/content/ContentQuery';
import {ArchiveServerEvent} from '@enonic/lib-contentstudio/app/event/ArchiveServerEvent';
import {ContentServerChangeItem} from '@enonic/lib-contentstudio/app/event/ContentServerChangeItem';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {ProjectContext} from '@enonic/lib-contentstudio/app/project/ProjectContext';
import Q from 'q';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import {ArchiveBrowseToolbarElement} from './ArchiveBrowseToolbar';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchiveContextView} from './ArchiveContextView';
import {ArchiveFilterPanel} from './ArchiveFilterPanel';
import {ArchiveHelper} from './ArchiveHelper';
import {ArchiveTreeGridActions} from './ArchiveTreeGridActions';
import {ArchiveTreeListSelectablePanelProxy} from './ArchiveTreeListSelectablePanelProxy';
import {ArchiveTreeRootList} from './ArchiveTreeRootList';
import {setContentFilterOpen} from '@enonic/lib-contentstudio/v6/features/store/contentFilter.store';
import {
    loadArchiveItems,
    removeArchiveItems,
    setArchiveFilterQuery,
} from './v6/features/store/archive-list';
import {clearSelection, setSelection} from './v6/features/store/archive-selection';
import {ArchiveTreeListElement} from './v6/features/views/browse/archive/ArchiveTreeListElement';

export class ArchiveBrowsePanel
    extends ResponsiveBrowsePanel {

    protected treeListBox: ArchiveTreeRootList;

    protected archiveTreeList: ArchiveTreeListElement;

    protected treeActions: ArchiveTreeGridActions;

    protected toolbar: ListBoxToolbar<ArchiveContentViewItem>;

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

        this.browseToolbar.hide();

        this.prependChild(new ArchiveBrowseToolbarElement({
            toggleFilterPanelAction: this.toggleFilterPanelAction,
            actions: this.treeActions.getAllActions(),
        }));

        this.archiveTreeList.setContextMenuActions(this.treeActions.getAllActions());
    }

    protected initListeners(): void {
        super.initListeners();

        this.filterPanel.onShown(() => setContentFilterOpen(true));
        this.filterPanel.onHidden(() => setContentFilterOpen(false));

        this.filterPanel.onSearchEvent((query?: ContentQuery) => {
            void setArchiveFilterQuery(query ?? null);
        });

        ArchiveServerEvent.on((event: ArchiveServerEvent) => {
            const type: NodeServerChangeType = event.getNodeChange().getChangeType();

            if (type === NodeServerChangeType.MOVE || type === NodeServerChangeType.DELETE) {
                const itemsToRemove: ContentServerChangeItem[] =
                    ArchiveHelper.filterTopMostItems(event.getNodeChange().getChangeItems()) as ContentServerChangeItem[];
                const ids: string[] = itemsToRemove.map((item) => item.getContentId().toString());

                removeArchiveItems(ids);
            }
        });

        let isRefreshTriggered = false;

        const refreshHandler = (): void => {
            isRefreshTriggered = false;
            clearSelection();
            this.filterPanel.reset(true).then(() => {
                this.hideFilterPanel();
                this.toggleFilterPanelButton.removeClass('filtered');
            });
            void loadArchiveItems();
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

        this.archiveTreeList.whenRendered(() => {
            void loadArchiveItems();
        });
    }

    protected updateContextView(item: ArchiveContentViewItem): Q.Promise<void> {
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
            refreshAction: () => {
                void loadArchiveItems();
            },
        });
        this.toolbar.hideAndDisableSelectionToggler();

        this.treeActions = new ArchiveTreeGridActions();
        this.archiveTreeList = new ArchiveTreeListElement();

        return new ArchiveTreeListSelectablePanelProxy(this.selectionWrapper, this.archiveTreeList, this.toolbar);
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

    protected enableSelectionMode() {
        const selectedItems = this.selectableListBoxPanel.getSelectedItems().map(item => item.getId());
        this.filterPanel.setSelectedItems(selectedItems);
    }

    protected disableSelectionMode() {
        this.filterPanel.resetConstraints();
        this.hideFilterPanel();
        void setArchiveFilterQuery(null);
        setSelection([]);
    }
}
