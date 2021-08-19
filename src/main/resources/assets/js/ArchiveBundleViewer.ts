import {NamesAndIconViewer} from 'lib-admin-ui/ui/NamesAndIconViewer';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ExtendedViewer} from 'lib-contentstudio/app/view/ExtendedViewer';
import {DateTimeFormatter} from 'lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {ArchiveBundleViewItem} from './ArchiveBundleViewItem';

export class ArchiveBundleViewer
    extends ExtendedViewer<ArchiveBundleViewItem> {

    constructor() {
        super('archive-bundle-viewer');
    }

    resolveDisplayName(item: ArchiveBundleViewItem): string {
        return item.getDisplayName();
    }

    protected resolveSecondaryName(item: ArchiveBundleViewItem): string {
        return DateTimeFormatter.createHtml(item.getArchiveTime());
    }

    resolveSubName(item: ArchiveBundleViewItem): string {
        return i18n('field.preview.toolbar.status',
            item.getArchivedBy()?.getDisplayName() || item.getData().getContentSummary().getModifier());
    }

    resolveIconClass(item: ArchiveBundleViewItem): string {
        return item.getIconClass();
    }
}
