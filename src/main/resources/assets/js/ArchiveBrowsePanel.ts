import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {BrowsePanel} from 'lib-admin-ui/app/browse/BrowsePanel';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {ArchiveTreeGrid} from './ArchiveTreeGrid';
import {ArchiveBrowseItemPanel} from './ArchiveBrowseItemPanel';
import * as Q from 'q';

export class ArchiveBrowsePanel extends BrowsePanel {

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
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

    protected getFirstPanelSize(): number {
        return 62;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-browse-panel');

            return rendered;
        });
    }
}
