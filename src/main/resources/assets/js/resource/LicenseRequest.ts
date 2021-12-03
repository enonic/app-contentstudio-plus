import {Path} from 'lib-admin-ui/rest/Path';
import {ResourceRequest} from 'lib-admin-ui/rest/ResourceRequest';

export abstract class LicenseRequest<T>
    extends ResourceRequest<T> {

    protected constructor() {
        super();
    }

    protected generateUrl(): string {
        // that makes it work from both studio and studio.plus context
        const idToReplace: string = CONFIG.appId.replace('.plus', '');
        return CONFIG.services.i18nUrl.replace(new RegExp(`${idToReplace}/`, 'g'), `${idToReplace}.plus/`).replace('i18n', 'license');
    }

    getRequestPath(): Path {
        return <any>this.generateUrl();
    }
}
