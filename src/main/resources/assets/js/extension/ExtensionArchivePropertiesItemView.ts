import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {DateTimeFormatter} from '@enonic/lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ExtensionBasePropertiesItemView} from '@enonic/lib-contentstudio/app/view/context/extension/details/ExtensionBasePropertiesItemView';
import {
    ExtensionBasePropertiesItemViewHelper
} from '@enonic/lib-contentstudio/app/view/context/extension/details/ExtensionBasePropertiesItemViewHelper';
import {ExtensionPropertiesItemViewHelper} from '@enonic/lib-contentstudio/app/view/context/extension/details/ExtensionPropertiesItemViewHelper';
import {ExtensionPropertiesItemViewValue} from '@enonic/lib-contentstudio/app/view/context/extension/details/ExtensionPropertiesItemViewValue';

export class ExtensionArchivePropertiesItemView
    extends ExtensionBasePropertiesItemView {

    protected createHelper(): ExtensionPropertiesItemViewHelper {
        return new ArchivePropertiesExtensionItemViewHelper();
    }

    protected layoutEditLink(): void {
        //
    }
}

export class ArchivePropertiesExtensionItemViewHelper
    extends ExtensionBasePropertiesItemViewHelper {

    protected getPrincipalKeysToFetch(): Set<string> {
        const principals =  super.getPrincipalKeysToFetch();

        principals.add(this.item.getContentSummary().getArchivedBy().toString());

        return principals;
    }

    protected doGenerateProps(): Map<string, ExtensionPropertiesItemViewValue> {
        const propsMap: Map<string, ExtensionPropertiesItemViewValue> = new Map<string, ExtensionPropertiesItemViewValue>();

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

    private setPropsArchived(propsMap: Map<string, ExtensionPropertiesItemViewValue>): void {
        const archivedBy = this.item.getContentSummary().getArchivedBy()?.toString();
        const archivedTime = this.item.getContentSummary().getArchivedTime();

        if (archivedTime && archivedBy) {
            const displayName = this.getFetchedPrincipal(archivedBy)?.getDisplayName();
            const archivedByText = i18n('text.by', DateTimeFormatter.createHtml(archivedTime), displayName || archivedBy);

            propsMap.set(i18n('field.archived'), new ExtensionPropertiesItemViewValue(archivedByText));
        }
    }

    private setPropsOriginalPath(propsMap: Map<string, ExtensionPropertiesItemViewValue>): void {
        const originalParentPath = this.item.getContentSummary().getOriginalParentPath();

        if (originalParentPath) {
            const separator = originalParentPath === Path.DEFAULT_ELEMENT_DIVIDER ? '' : Path.DEFAULT_ELEMENT_DIVIDER;
            const path = `${originalParentPath}${separator}${this.item.getContentSummary().getOriginalName()}`;

            propsMap.set(i18n('field.originalPath'), new ExtensionPropertiesItemViewValue(path, path));
        }
    }
}
