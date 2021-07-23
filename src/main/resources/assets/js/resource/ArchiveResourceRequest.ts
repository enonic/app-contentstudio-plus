import { ContentResourceRequest } from 'lib-contentstudio/app/resource/ContentResourceRequest';

export abstract class ArchiveResourceRequest<PARSED_TYPE>
    extends ContentResourceRequest<PARSED_TYPE> {

    protected constructor() {
        super();

        this.addRequestPathElements('archive');
    }
}
