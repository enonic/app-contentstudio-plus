import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {BrowsePanel} from 'lib-admin-ui/app/browse/BrowsePanel';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
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

    private createBackgroundContainer(): DivEl {
        return new DivEl('background-container');
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.gridAndItemsSplitPanel.whenRendered(() => {
                this.createBackgroundContainer().insertAfterEl(this.gridAndItemsSplitPanel);
            });
            this.addClass('archive-browse-panel');

            return rendered;
        });
    }
}
