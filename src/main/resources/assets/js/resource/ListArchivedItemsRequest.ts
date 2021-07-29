import {ArchiveResourceRequest} from './ArchiveResourceRequest';
import {ListArchivedItemsResult} from '../ListArchivedItemsResult';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';

export class ListArchivedItemsRequest extends ArchiveResourceRequest<ListArchivedItemsResult[]> {

    constructor() {
        super();

        this.addRequestPathElements('list');
    }

    parseResponse(response: JsonResponse<ListArchivedItemsResult[]>): ListArchivedItemsResult[] {
        return response.getResult();
    }

}
