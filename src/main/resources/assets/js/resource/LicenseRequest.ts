import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ResourceRequest} from '@enonic/lib-admin-ui/rest/ResourceRequest';
import {$config} from '../shared/config';

export abstract class LicenseRequest<T>
    extends ResourceRequest<T> {

    getRequestPath(): Path {
        return Path.fromString($config.get().services.licenseUrl);
    }
}
