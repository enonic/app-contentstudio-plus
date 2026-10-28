import {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import type {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ContentSummaryJson} from '@enonic/lib-contentstudio/app/content/ContentSummaryJson';
import {ContentSummaryAndCompareStatusFetcher} from '@enonic/lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {requestJson} from '@enonic/ui-utils/request';
import {CONTENT_ROOT, getCmsRestUrl, withParams} from './cms';

export async function fetchVariants(id: string): Promise<ContentSummaryAndCompareStatus[]> {
    const url = withParams(getCmsRestUrl(CONTENT_ROOT, 'findVariants'), {id, from: 0, size: -1});

    const summaries = await requestJson<{contents: ContentSummaryJson[]}>(url).match(
        (json) => ContentSummary.fromJsonArray(json.contents),
        (error) => {
            throw error;
        },
    );

    return new ContentSummaryAndCompareStatusFetcher().fetchAndCompareStatus(summaries.map((item) => item.getContentId()));
}
