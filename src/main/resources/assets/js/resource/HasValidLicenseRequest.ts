import {Response} from 'lib-admin-ui/rest/Response';
import {LicenseRequest} from './LicenseRequest';

export class HasValidLicenseRequest
    extends LicenseRequest<boolean> {

    constructor() {
        super();
    }

    protected parseResponse(response: Response): boolean {
        return !!response.getResult()['hasValidLicense'];
    }
}