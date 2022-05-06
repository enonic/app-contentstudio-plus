import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {ArchiveTreeGrid} from './ArchiveTreeGrid';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import * as Q from 'q';
import {ArchiveContextView} from './ArchiveContextView';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {NonMobileContextPanelToggleButton} from 'lib-contentstudio/app/view/context/button/NonMobileContextPanelToggleButton';
import {ResponsiveBrowsePanel} from 'lib-contentstudio/app/browse/ResponsiveBrowsePanel';
import {ArchiveFilterPanel} from './ArchiveFilterPanel';
import {ContentQuery} from 'lib-contentstudio/app/content/ContentQuery';

export class ArchiveBrowsePanel
    extends ResponsiveBrowsePanel {

    protected contextView: ArchiveContextView;

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-browse-panel');

            return rendered;
        });
    }

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
        this.browseToolbar.appendChild(new NonMobileContextPanelToggleButton());
    }

    protected initListeners(): void {
        super.initListeners();

        (<ArchiveFilterPanel>this.filterPanel).onSearchEvent((query?: ContentQuery) => {
            (<ArchiveTreeGrid>this.treeGrid).setFilterQuery(query);
        });
    }

    protected updateContextView(item: ArchiveContentViewItem): void {
        void this.contextView.setItem(item?.getData());
        this.contextView.setArchiveItem(item);
    }

    protected createTreeGrid(): ArchiveTreeGrid {
        return new ArchiveTreeGrid();
    }

    protected createBrowseItemPanel(): BrowseItemPanel {
        return new ArchiveBrowseItemPanel();
    }

    protected togglePreviewPanelDependingOnScreenSize(): void {
        //
    }

    protected createContextView(): ArchiveContextView {
        return new ArchiveContextView();
    }

    protected createFilterPanel(): ArchiveFilterPanel {
        return new ArchiveFilterPanel();
    }
}
