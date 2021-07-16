import { AppPanel } from "lib-admin-ui/app/AppPanel";
import { BrowsePanel } from "lib-admin-ui/app/browse/BrowsePanel";
import {ArchiveBrowsePanel} from './ArchiveBrowsePanel';

export class ArchiveAppPanel extends AppPanel {

    protected createBrowsePanel(): BrowsePanel {
        return new ArchiveBrowsePanel();
    }
}