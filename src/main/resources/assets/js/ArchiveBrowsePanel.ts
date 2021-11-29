import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {ArchiveTreeGrid} from './ArchiveTreeGrid';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import * as Q from 'q';
import {ArchiveContextView} from './ArchiveContextView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {NonMobileContextPanelToggleButton} from 'lib-contentstudio/app/view/context/button/NonMobileContextPanelToggleButton';
import {ResponsiveBrowsePanel} from 'lib-contentstudio/app/browse/ResponsiveBrowsePanel';
import {ResponsiveToolbar} from 'lib-contentstudio/app/browse/ResponsiveToolbar';

export class ArchiveBrowsePanel
    extends ResponsiveBrowsePanel {

    protected treeGrid: ArchiveTreeGrid;

    protected contextView: ArchiveContextView;

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
        this.browseToolbar.appendChild(new NonMobileContextPanelToggleButton());
    }

    protected updateContextView(item: ArchiveContentViewItem) {
        this.contextView.setItem(item?.getData());
        this.contextView.setArchiveItem(item);
    }

    protected createTreeGrid(): ArchiveTreeGrid {
        return new ArchiveTreeGrid();
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

    protected togglePreviewPanelDependingOnScreenSize(): void {
        //
    }

    protected createContextView(): ArchiveContextView {
        return new ArchiveContextView();
    }
}
