import {Path} from 'lib-admin-ui/rest/Path';
import {ResourceRequest} from 'lib-admin-ui/rest/ResourceRequest';

export abstract class LicenseRequest<T>
    extends ResourceRequest<T> {

    protected constructor() {
        super();
    }

    getRequestPath(): Path {
        return Path.fromString(CONFIG.services.licenseUrl);
    }
}
