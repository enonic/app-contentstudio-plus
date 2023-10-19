import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryJson} from 'lib-contentstudio/app/content/ContentSummaryJson';
import {CmsContentResourceRequest} from 'lib-contentstudio/app/resource/CmsContentResourceRequest';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ListContentResult} from 'lib-contentstudio/app/resource/ListContentResult';
import Q from 'q';

export class GetContentVariantsRequest extends CmsContentResourceRequest<ContentSummary[]> {

    private readonly id: string;

    private readonly from: number;

    private readonly size: number;
    // caching until lazy loading introduced, then other approach will be required
    private static variantsCache: Map<string, ContentSummaryAndCompareStatus[]> = new Map<string, ContentSummaryAndCompareStatus[]>();

    constructor(id: string, from?: number, size?: number) {
        super();

        this.id = id;
        this.from = from || 0;
        this.size = size || -1;

        this.addRequestPathElements('findVariants');
    }

    getParams(): object {
        return {
            id: this.id,
            from: this.from,
            size: this.size,
        };
    }

    fetchWithCompareStatus(): Q.Promise<ContentSummaryAndCompareStatus[]> {
        return super.sendAndParse().then((items: ContentSummary[]) => {
            return new ContentSummaryAndCompareStatusFetcher().fetchStatus(items).then((contents: ContentSummaryAndCompareStatus[]) => {
                GetContentVariantsRequest.variantsCache.set(this.id, contents);
                return contents;
            });
        });
    }

    protected parseResponse(response: JsonResponse<ListContentResult<ContentSummaryJson>>): ContentSummary[] {
        return ContentSummary.fromJsonArray(response.getResult().contents);
    }

    static getCachedVariants(id: string): ContentSummaryAndCompareStatus[] {
        return GetContentVariantsRequest.variantsCache.get(id);
    }
}