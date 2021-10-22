import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {BrowsePanel} from 'lib-admin-ui/app/browse/BrowsePanel';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {ArchiveTreeGrid} from './ArchiveTreeGrid';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import * as Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {SplitPanel} from 'lib-admin-ui/ui/panel/SplitPanel';
import {ContextSplitPanel} from 'lib-contentstudio/app/view/context/ContextSplitPanel';
import {DockedContextPanel} from 'lib-contentstudio/app/view/context/DockedContextPanel';
import {ArchiveContextView} from './ArchiveContextView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {NonMobileContextPanelToggleButton} from 'lib-contentstudio/app/view/context/button/NonMobileContextPanelToggleButton';

export class ArchiveBrowsePanel
    extends BrowsePanel {

    protected treeGrid: ArchiveTreeGrid;

    private contextView: ArchiveContextView;

    private contextSplitPanel: ContextSplitPanel;

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
        this.browseToolbar.appendChild(new NonMobileContextPanelToggleButton());
    }

    protected initListeners(): void {
        super.initListeners();

        this.contextSplitPanel.onMobileModeChanged((isMobile: boolean) => {
            if (isMobile) {
                this.gridAndItemsSplitPanel.hideSecondPanel();
            } else {
                this.gridAndItemsSplitPanel.showFirstPanel();
                this.gridAndItemsSplitPanel.showSecondPanel();
            }
        });
    }

    protected updatePreviewItem(): void {
        super.updatePreviewItem();

        const item: ArchiveContentViewItem = <ArchiveContentViewItem>this.treeGrid.getLastSelectedOrHighlightedItem();
        const summary: ContentSummaryAndCompareStatus = item?.getData();

        this.contextView.setItem(summary);
        this.contextView.setArchiveItem(item);

        if (this.treeGrid.hasHighlightedNode()) {
            if (this.contextSplitPanel.isMobileMode()) {
                this.gridAndItemsSplitPanel.hideFirstPanel();
                this.gridAndItemsSplitPanel.showSecondPanel();
            }
        }
    }

    protected createTreeGrid(): ArchiveTreeGrid {
        return new ArchiveTreeGrid();
    }

    protected createToolbar(): Toolbar {
        return new Toolbar();
    }

    protected createBrowseItemPanel(): BrowseItemPanel {
        return new ArchiveBrowseItemPanel();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-browse-panel');

            return rendered;
        });
    }

    protected createBrowseWithItemsPanel(): SplitPanel {
        this.contextView = new ArchiveContextView();

        this.contextSplitPanel = ContextSplitPanel.create(this.getBrowseItemPanel(),
            new DockedContextPanel(this.contextView))
            .setActions(this.getBrowseActions().getAllActions())
            .setContextView(this.contextView)
            .build();

        this.contextSplitPanel.onFoldClicked(() => {
            this.gridAndItemsSplitPanel.showFirstPanel();
            this.gridAndItemsSplitPanel.showFirstPanel();
            this.gridAndItemsSplitPanel.hideSecondPanel();
        });

        return this.contextSplitPanel;
    }

    protected togglePreviewPanelDependingOnScreenSize(): void {
        //
    }
}
