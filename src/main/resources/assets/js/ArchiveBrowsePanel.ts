import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {BrowsePanel} from 'lib-admin-ui/app/browse/BrowsePanel';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {ArchiveTreeGrid} from './ArchiveTreeGrid';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import * as Q from 'q';
import {Button} from 'lib-admin-ui/ui/button/Button';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ToggleContextPanelEvent} from 'lib-contentstudio/app/view/context/ToggleContextPanelEvent';
import {SplitPanel} from 'lib-admin-ui/ui/panel/SplitPanel';
import {ContextSplitPanel} from 'lib-contentstudio/app/view/context/ContextSplitPanel';
import {ContextPanel} from 'lib-contentstudio/app/view/context/ContextPanel';
import {ActiveContextPanelManager} from 'lib-contentstudio/app/view/context/ActiveContextPanelManager';
import {DockedContextPanel} from 'lib-contentstudio/app/view/context/DockedContextPanel';
import {ArchiveContextView} from './ArchiveContextView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';

export class ArchiveBrowsePanel
    extends BrowsePanel {

    protected treeGrid: ArchiveTreeGrid;

    private contextView: ArchiveContextView;

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
        this.addContextPanelButton();
    }

    private addContextPanelButton() {
        const button: Button = new Button();
        button.addClass('toggle-button icon-list');
        this.browseToolbar.appendChild(button);

        button.onClicked(() => {
            new ToggleContextPanelEvent().fire();
            button.toggleClass('expanded', !button.hasClass('expanded'));
        });
    }

    protected updatePreviewItem(): void {
        super.updatePreviewItem();

        const item: ArchiveContentViewItem = <ArchiveContentViewItem>this.treeGrid.getLastSelectedOrHighlightedItem();
        const summary: ContentSummaryAndCompareStatus = item?.getData();
        const contextPanel: ContextPanel = ActiveContextPanelManager.getActiveContextPanel();

        if (contextPanel) {
            contextPanel.setItem(summary);
            this.contextView.setArchiveItem(item);
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

        const contextSplitPanel: ContextSplitPanel = ContextSplitPanel.create(this.getBrowseItemPanel(),
            new DockedContextPanel(this.contextView))
            .setActions(this.getBrowseActions().getAllActions())
            .setContextView(this.contextView)
            .build();

        return contextSplitPanel;
    }
}
