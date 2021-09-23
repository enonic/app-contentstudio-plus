import {CmsProjectBasedResourceRequest} from 'lib-contentstudio/app/wizard/CmsProjectBasedResourceRequest';

export abstract class ArchiveResourceRequest<PARSED_TYPE>
    extends CmsProjectBasedResourceRequest<PARSED_TYPE> {

    static ARCHIVE_PATH: string = 'archive'

    protected constructor() {
        super();

        this.addRequestPathElements('content', ArchiveResourceRequest.ARCHIVE_PATH);
        this.setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH);
    }
}
