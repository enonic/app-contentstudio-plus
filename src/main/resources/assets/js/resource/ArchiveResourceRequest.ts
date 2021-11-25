import {CmsProjectBasedResourceRequest} from 'lib-contentstudio/app/wizard/CmsProjectBasedResourceRequest';
import {ContentResourceRequest} from 'lib-contentstudio/app/resource/ContentResourceRequest';

export abstract class ArchiveResourceRequest<PARSED_TYPE>
    extends CmsProjectBasedResourceRequest<PARSED_TYPE> {

    static ARCHIVE_PATH = 'archive';

    protected constructor() {
        super();

        this.addRequestPathElements(ContentResourceRequest.CONTENT_PATH, ArchiveResourceRequest.ARCHIVE_PATH);
        this.setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH);
    }
}
