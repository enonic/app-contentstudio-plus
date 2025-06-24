import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {DateTimeFormatter} from '@enonic/lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {BasePropertiesWidgetItemView} from 'lib-contentstudio/app/view/context/widget/details/BasePropertiesWidgetItemView';
import {BasePropertiesWidgetItemViewHelper} from 'lib-contentstudio/app/view/context/widget/details/BasePropertiesWidgetItemViewHelper';
import {PropertiesWidgetItemViewHelper} from 'lib-contentstudio/app/view/context/widget/details/PropertiesWidgetItemViewHelper';
import {PropertiesWidgetItemViewValue} from 'lib-contentstudio/app/view/context/widget/details/PropertiesWidgetItemViewValue';

export class ArchivePropertiesWidgetItemView
    extends BasePropertiesWidgetItemView {

    protected createHelper(): PropertiesWidgetItemViewHelper {
        return new ArchivePropertiesWidgetItemViewHelper();
    }

    protected layoutEditLink(): void {
        //
    }
}

export class ArchivePropertiesWidgetItemViewHelper
    extends BasePropertiesWidgetItemViewHelper {

    protected getPrincipalKeysToFetch(): Set<string> {
        const principals =  super.getPrincipalKeysToFetch();

        principals.add(this.item.getContentSummary().getArchivedBy().toString());

        return principals;
    }

    protected doGenerateProps(): Map<string, PropertiesWidgetItemViewValue> {
        const propsMap: Map<string, PropertiesWidgetItemViewValue> = new Map<string, PropertiesWidgetItemViewValue>();

        this.setPropsFieldId(propsMap);
        this.setPropsType(propsMap);
        this.setPropsApp(propsMap);
        this.setPropsCreated(propsMap);
        this.setPropsModified(propsMap);
        this.setPropsArchived(propsMap);
        this.setPropsOriginalPath(propsMap);
        this.setPropsPublishFirstTime(propsMap);
        this.setPropsLang(propsMap);
        this.setPropsOwner(propsMap);

        return propsMap;
    }

    private setPropsArchived(propsMap: Map<string, PropertiesWidgetItemViewValue>): void {
        const archivedBy = this.item.getContentSummary().getArchivedBy()?.toString();
        const archivedTime = this.item.getContentSummary().getArchivedTime();

        if (archivedTime && archivedBy) {
            const displayName = this.getFetchedPrincipal(archivedBy)?.getDisplayName();
            const archivedByText = i18n('text.by', DateTimeFormatter.createHtml(archivedTime), displayName || archivedBy);

            propsMap.set(i18n('field.archived'), new PropertiesWidgetItemViewValue(archivedByText));
        }
    }

    private setPropsOriginalPath(propsMap: Map<string, PropertiesWidgetItemViewValue>): void {
        const originalParentPath = this.item.getContentSummary().getOriginalParentPath();

        if (originalParentPath) {
            const separator = originalParentPath === Path.DEFAULT_ELEMENT_DIVIDER ? '' : Path.DEFAULT_ELEMENT_DIVIDER;
            const path = `${originalParentPath}${separator}${this.item.getContentSummary().getOriginalName()}`;

            propsMap.set(i18n('field.originalPath'), new PropertiesWidgetItemViewValue(path, path));
        }
    }
}
