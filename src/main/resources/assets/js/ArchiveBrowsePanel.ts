import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';
import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {SelectableTreeListBoxKeyNavigator} from '@enonic/lib-admin-ui/ui/selector/list/SelectableTreeListBoxKeyNavigator';
import {ResponsiveBrowsePanel} from '@enonic/lib-contentstudio/app/browse/ResponsiveBrowsePanel';
import type {BrowseHostConfig} from '@enonic/lib-contentstudio/v6/pages/browse/ui/layout/BrowseLayout';
import Q from 'q';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import {ArchiveBrowseToolbarElement} from './ArchiveBrowseToolbar';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchiveTreeListSelectablePanelProxy} from './ArchiveTreeListSelectablePanelProxy';
import {ArchiveTreeRootList} from './ArchiveTreeRootList';
import {$isContentFilterOpen, setContentFilterOpen} from '@enonic/lib-contentstudio/v6/features/search/model/contentFilter.store';
import {subscribeToArchiveEvents} from './shared/events';
import {$activeProject} from './shared/project';
import {loadArchiveItems, removeArchiveItems} from './v6/features/store/archive-list';
import {refreshArchiveSearchFacets, resetArchiveSearch} from './v6/features/store/archive-search';
import {clearSelection} from './v6/features/store/archive-selection';
import {ArchiveTreeListElement} from './v6/features/views/browse/archive/ArchiveTreeListElement';
import {ArchiveFilterPanelElement} from './v6/features/views/browse/filter/ArchiveFilterPanel';
import {ARCHIVE_CONTEXT_PANEL, registerArchiveContextWidgets} from './v6/features/views/context/archiveContextWidgets';

export class ArchiveBrowsePanel
    extends ResponsiveBrowsePanel {

    protected treeListBox: ArchiveTreeRootList;

    protected archiveTreeList: ArchiveTreeListElement;

    protected toolbar: ListBoxToolbar<ArchiveContentViewItem>;

    protected selectionWrapper: SelectableListBoxWrapper<ArchiveContentViewItem>;

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-browse-panel');

            return rendered;
        });
    }

    protected initElements(): void {
        registerArchiveContextWidgets();
        super.initElements();

        this.browseLayout.setProps({filterPanel: new ArchiveFilterPanelElement()});
        this.browseToolbar.hide();

        this.prependChild(new ArchiveBrowseToolbarElement());
    }

    protected initListeners(): void {
        super.initListeners();

        let isRefreshTriggered = false;

        const refreshHandler = (): void => {
            isRefreshTriggered = false;
            clearSelection();
            setContentFilterOpen(false);
            void resetArchiveSearch();
        };

        const refreshWhenShown = (): void => {
            if (!isRefreshTriggered) {
                isRefreshTriggered = true;
                this.whenShown(refreshHandler);
            }
        };

        subscribeToArchiveEvents({
            onArchived: refreshWhenShown,
            onRemoved: (ids) => {
                removeArchiveItems(ids);
                if ($isContentFilterOpen.get()) {
                    void refreshArchiveSearchFacets();
                }
            },
        });

        $activeProject.listen(refreshWhenShown);

        this.archiveTreeList.whenRendered(() => {
            void loadArchiveItems();
        });
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

        this.archiveTreeList = new ArchiveTreeListElement();

        return new ArchiveTreeListSelectablePanelProxy(this.selectionWrapper, this.archiveTreeList, this.toolbar);
    }

    protected togglePreviewPanelDependingOnScreenSize(): void {
        //
    }

    protected createKeyNavigator() {
        return new SelectableTreeListBoxKeyNavigator(this.selectionWrapper);
    }

    protected getBrowseHostConfig(): BrowseHostConfig {
        return {storageId: 'archive-layout', contextPanel: ARCHIVE_CONTEXT_PANEL};
    }
}
