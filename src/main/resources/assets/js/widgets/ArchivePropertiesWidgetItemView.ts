import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {DateTimeFormatter} from '@enonic/lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {BasePropertiesWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/BasePropertiesWidgetItemView';


export class ArchivePropertiesWidgetItemView
    extends BasePropertiesWidgetItemView {

    protected layoutProperties(): void {
        super.layoutProperties();

        const archived: string = i18n('status.archived');
        const archivedDate: string = DateTimeFormatter.createHtml(this.item.getContentSummary()?.getArchivedTime());
        this.insertKeyValue(archived, archivedDate, this.getIndexToInsertArchived());
    }

    private getIndexToInsertArchived(): number {
        const indexOfModified: number =
            this.list.getChildren().findIndex((child: Element) => child.getHtml().indexOf(i18n('field.modified')) > -1);

        if (indexOfModified > -1) {
            return indexOfModified + 2;
        }

        return this.list.getChildren().length;
    }

    protected layoutEditLink(): void {
        //
    }
}
