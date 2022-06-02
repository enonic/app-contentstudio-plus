import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ResourceRequest} from '@enonic/lib-admin-ui/rest/ResourceRequest';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export abstract class LicenseRequest<T>
    extends ResourceRequest<T> {

    getRequestPath(): Path {
        return Path.fromString(CONFIG.getString('services.licenseUrl'));
    }
}
