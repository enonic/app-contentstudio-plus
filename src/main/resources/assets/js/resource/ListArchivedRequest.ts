import {ArchiveResourceRequest} from './ArchiveResourceRequest';
import {ArchivedContainer} from '../ArchivedContainer';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {ArchivedContainerJson} from '../ArchivedContainerJson';

export class ListArchivedRequest
    extends ArchiveResourceRequest<ArchivedContainer[]> {

    constructor() {
        super();

        this.addRequestPathElements('list');
    }

    parseResponse(response: JsonResponse<ArchivedContainerJson[]>): ArchivedContainer[] {
        return response.getResult().map((item: ArchivedContainerJson) => ArchivedContainer.fromJson(item));
    }
}
