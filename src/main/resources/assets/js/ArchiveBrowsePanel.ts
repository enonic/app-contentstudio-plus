import { BrowseItemPanel } from "lib-admin-ui/app/browse/BrowseItemPanel";
import { BrowsePanel } from "lib-admin-ui/app/browse/BrowsePanel";
import { Toolbar } from "lib-admin-ui/ui/toolbar/Toolbar";
import { TreeGrid } from "lib-admin-ui/ui/treegrid/TreeGrid";
import { TreeGridBuilder } from "lib-admin-ui/ui/treegrid/TreeGridBuilder";
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveTreeGrid} from './ArchiveTreeGrid';
import {ContentBrowseItemPanel} from 'lib-contentstudio/app/browse/ContentBrowseItemPanel';

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
        return new ContentBrowseItemPanel();
    }
}
