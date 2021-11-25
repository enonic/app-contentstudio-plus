import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {ContentBrowseItemPanel} from 'lib-contentstudio/app/browse/ContentBrowseItemPanel';
import {ArchiveItemStatisticsPanel} from './ArchiveItemStatisticsPanel';

export class ArchiveBrowseItemPanel
    extends BrowseItemPanel {

    createItemStatisticsPanel(): ArchiveItemStatisticsPanel {
        return new ArchiveItemStatisticsPanel();
    }
}
