import { CmsProjectBasedResourceRequest } from 'lib-contentstudio/app/wizard/CmsProjectBasedResourceRequest';

export abstract class ArchiveResourceRequest<PARSED_TYPE>
    extends CmsProjectBasedResourceRequest<PARSED_TYPE> {

    protected constructor() {
        super();

        this.addRequestPathElements('content', 'archive');
    }
}
