import {HttpMethod} from '@enonic/lib-admin-ui/rest/HttpMethod';
import {TaskArchiveResourceRequest} from './TaskArchiveResourceRequest';

interface Params {
    contentIds: string[];
}

export class RestoreArchivedRequest extends TaskArchiveResourceRequest {
    private readonly ids: string[];

    constructor(ids: string[]) {
        super();

        this.ids = ids;
        this.setMethod(HttpMethod.POST);
        this.addRequestPathElements('restore');
    }

    getParams(): Params {
        return {
            contentIds: this.ids,
        };
    }
}
