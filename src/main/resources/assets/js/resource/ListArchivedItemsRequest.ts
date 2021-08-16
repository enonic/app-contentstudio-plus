import {ArchiveResourceRequest} from './ArchiveResourceRequest';
import {ListArchivedItemsResult} from '../ListArchivedItemsResult';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';

export class ListArchivedItemsRequest extends ArchiveResourceRequest<ListArchivedItemsResult[]> {

    private readonly parentId?: string;

    constructor(parentId?: string) {
        super();

        this.parentId = parentId;
        this.addRequestPathElements('list');
    }

    getParams(): Object {
        return !!this.parentId ? {parentId: this.parentId} : super.getParams();
    }

    parseResponse(response: JsonResponse<ListArchivedItemsResult[]>): ListArchivedItemsResult[] {
        return response.getResult();
    }

}
