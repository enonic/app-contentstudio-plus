import {NamePrettyfier} from '@enonic/lib-admin-ui/NamePrettyfier';
import {ContentPath} from '@enonic/lib-contentstudio/app/content/ContentPath';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export type ContentDisplay = {
    displayName: string;
    pathString: string;
};

export const resolveContentDisplay = (content: ContentSummaryAndCompareStatus): ContentDisplay => {
    const summary = content.getContentSummary();
    const isUnnamed = summary.getName().isUnnamed();

    const displayName = content.getDisplayName()
        || NamePrettyfier.prettifyUnnamed(summary.getType().getLocalName());

    const pathString = isUnnamed
        ? ContentPath.create()
            .fromParent(summary.getPath().getParentPath(), NamePrettyfier.prettifyUnnamed())
            .build()
            .toString()
        : summary.getPath().toString();

    return {displayName, pathString};
};
