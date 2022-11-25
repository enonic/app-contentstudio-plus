import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {ContentSummaryJson} from 'lib-contentstudio/app/content/ContentSummaryJson';
import {CmsContentResourceRequest} from 'lib-contentstudio/app/resource/CmsContentResourceRequest';
import {ListContentResult} from 'lib-contentstudio/app/resource/ListContentResult';

export class GetContentVariantsRequest extends CmsContentResourceRequest<ContentSummary[]> {

    private readonly id: string;

    private readonly from: number;

    private readonly size: number;

    constructor(id: string, from?: number, size?: number) {
        super();

        this.id = id;
        this.from = from || 0;
        this.size = size || -1;

        this.addRequestPathElements('findVariants');
    }

    getParams(): any {
        return {
            id: this.id,
            from: this.from,
            size: this.size,
        };
    }

    protected parseResponse(response: JsonResponse<ListContentResult<ContentSummaryJson>>): ContentSummary[] {
        return ContentSummary.fromJsonArray(response.getResult().contents);
    }
}