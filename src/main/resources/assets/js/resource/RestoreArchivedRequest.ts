import { HttpMethod } from 'lib-admin-ui/rest/HttpMethod';
import { ContentId } from 'lib-contentstudio/app/content/ContentId';
import {ArchiveResourceRequest} from './ArchiveResourceRequest';

export class RestoreArchivedRequest extends ArchiveResourceRequest<any> {

    private readonly ids: ContentId[];

    constructor(ids: ContentId[]) {
        super();

        this.ids = ids;
        this.setMethod(HttpMethod.POST);
        this.addRequestPathElements('restore');
    }

    getParams(): Object {
        return {
            contentIds: this.ids.map(id => id.toString())
        };
    }
}
