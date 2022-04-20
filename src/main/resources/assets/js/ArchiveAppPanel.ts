import {AppPanel} from 'lib-admin-ui/app/AppPanel';
import {BrowsePanel} from 'lib-admin-ui/app/browse/BrowsePanel';
import {ArchiveBrowsePanel} from './ArchiveBrowsePanel';

export class ArchiveAppPanel
    extends AppPanel {

    constructor() {
        super('archive-app-panel content-app-panel');

        this.setDoOffset(false);
    }

    protected createBrowsePanel(): BrowsePanel {
        return new ArchiveBrowsePanel();
    }
}
