import {ContentVersions} from 'lib-contentstudio/app/ContentVersions';
import {ContentVersionPublishInfo} from 'lib-contentstudio/app/ContentVersionPublishInfo';
import {DateTimeFormatter} from 'lib-admin-ui/ui/treegrid/DateTimeFormatter';

export class ArchiveHelper {

    static getArchivedDate(versions: ContentVersions): string {
        const publishInfo: ContentVersionPublishInfo = versions.getActiveVersion().getPublishInfo();

        if (publishInfo?.isArchived()) {
            return DateTimeFormatter.createHtml(publishInfo.getTimestamp());
        }

        return DateTimeFormatter.createHtml(versions.getActiveVersion().getModified());
    }
}
