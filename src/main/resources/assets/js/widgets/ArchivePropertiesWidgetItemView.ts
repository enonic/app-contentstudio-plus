import {PropertiesWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/PropertiesWidgetItemView';
import {Application} from 'lib-admin-ui/application/Application';
import {i18n} from 'lib-admin-ui/util/Messages';
import {GetContentVersionsRequest} from 'lib-contentstudio/app/resource/GetContentVersionsRequest';
import {ContentVersions} from 'lib-contentstudio/app/ContentVersions';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ArchiveHelper} from '../ArchiveHelper';
import {Element} from 'lib-admin-ui/dom/Element';

export class ArchivePropertiesWidgetItemView
    extends PropertiesWidgetItemView {

    protected layoutApplication(application?: Application): void {
        super.layoutApplication(application);

        new GetContentVersionsRequest(this.content.getContentId()).sendAndParse().then((versions: ContentVersions) => {
            const archived: string = i18n('status.archived');
            const archivedDate: string = ArchiveHelper.getArchivedDate(versions);
            this.insertKeyValue(archived, archivedDate, this.getIndexToInsertArchived());
        }).catch(DefaultErrorHandler.handle);
    }

    private getIndexToInsertArchived(): number {
        const indexOfModified: number =
            this.list.getChildren().findIndex((child: Element) => child.getHtml().indexOf(i18n('field.modified')) > -1);

        if (indexOfModified > -1) {
            return indexOfModified + 2;
        }

        return this.list.getChildren().length;
    }
}
