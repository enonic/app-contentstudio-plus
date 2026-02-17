import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export interface FetchResponse {
    items: ContentSummaryAndCompareStatus[];
    total: number;
}
