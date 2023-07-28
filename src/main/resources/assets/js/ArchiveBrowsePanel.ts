import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
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

        (this.filterPanel as ArchiveFilterPanel).onSearchEvent((query?: ContentQuery) => {
            (this.treeGrid as ArchiveTreeGrid).setFilterQuery(query);
        });
    }

    protected updateContextView(item: ArchiveContentViewItem): Q.Promise<void> {
        this.contextView.setArchiveItem(item);
        return this.contextView.setItem(item?.getData());
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
