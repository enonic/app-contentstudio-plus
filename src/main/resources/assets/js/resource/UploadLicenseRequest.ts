import {HttpMethod} from 'lib-admin-ui/rest/HttpMethod';
import {LicenseRequest} from './LicenseRequest';
import {Response} from 'lib-admin-ui/rest/Response';

export class UploadLicenseRequest
    extends LicenseRequest<boolean> {

    private readonly file: File;

    constructor(file: File) {
        super();

        this.setMethod(HttpMethod.POST);
        this.setIsFormRequest(true);
        this.file = file;
    }

    getParams(): Object {
        return {
            license: this.file
        };
    }

    protected parseResponse(response: Response): boolean {
        return !!response.getResult()['licenseValid'];
    }
}
