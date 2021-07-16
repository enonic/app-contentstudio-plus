import { BrowseItemPanel } from "lib-admin-ui/app/browse/BrowseItemPanel";
import { BrowsePanel } from "lib-admin-ui/app/browse/BrowsePanel";
import { Toolbar } from "lib-admin-ui/ui/toolbar/Toolbar";
import { TreeGrid } from "lib-admin-ui/ui/treegrid/TreeGrid";
import { TreeGridBuilder } from "lib-admin-ui/ui/treegrid/TreeGridBuilder";

export class ArchiveBrowsePanel extends BrowsePanel {

    protected createTreeGrid(): TreeGrid<any> {
        return new TreeGrid<any>(new TreeGridBuilder<any>());
    }

    protected createToolbar(): Toolbar {
        return new Toolbar();
    }

    protected createBrowseItemPanel(): BrowseItemPanel {
        return new BrowseItemPanel();
    }
}