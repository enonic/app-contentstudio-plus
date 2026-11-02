import {requestJson} from '@enonic/ui-utils/request';
import type {ContentListJson, ContentSummaryJson} from '../../../resource/json/ContentSummaryJson';
import {toVariantContent, type VariantContent} from '../views/context/widget/variants/variantContent';
import {CONTENT_ROOT, getCmsRestUrl, withParams} from './cms';

export type DuplicateParams = {
    contentId: string;
    parent: string;
    name: string;
};

const rethrow = (error: Error): never => {
    throw error;
};

export function fetchContent(contentId: string): Promise<VariantContent> {
    const url = withParams(getCmsRestUrl(CONTENT_ROOT, ''), {id: contentId});

    return requestJson<ContentSummaryJson>(url).match(toVariantContent, rethrow);
}

export function fetchVariants(contentId: string): Promise<VariantContent[]> {
    const url = withParams(getCmsRestUrl(CONTENT_ROOT, 'findVariants'), {id: contentId, from: 0, size: -1});

    return requestJson<ContentListJson>(url).match((json) => json.contents.map(toVariantContent), rethrow);
}

export function duplicateAsVariant({contentId, parent, name}: DuplicateParams): Promise<string> {
    return requestJson<{taskId: string}>(getCmsRestUrl(CONTENT_ROOT, 'duplicate'), {
        method: 'POST',
        body: {contents: [{contentId, includeChildren: false, variant: true, parent, name}]},
    }).match((json) => json.taskId, rethrow);
}
