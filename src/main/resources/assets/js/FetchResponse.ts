import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export interface FetchResponse {
    items: ContentSummaryAndCompareStatus[];
    total: number;
}
