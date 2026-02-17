import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ArchiveItemStatisticsPanel} from './ArchiveItemStatisticsPanel';

export class ArchiveBrowseItemPanel
    extends BrowseItemPanel {

    createItemStatisticsPanel(): ArchiveItemStatisticsPanel {
        return new ArchiveItemStatisticsPanel();
    }
}
