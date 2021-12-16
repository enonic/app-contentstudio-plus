import {HttpMethod} from 'lib-admin-ui/rest/HttpMethod';
import {LicenseRequest} from './LicenseRequest';
import {Response} from 'lib-admin-ui/rest/Response';

interface LicenseParams { license: File }

export class UploadLicenseRequest
    extends LicenseRequest<boolean> {

    private readonly file: File;

    constructor(file: File) {
        super();

        this.setMethod(HttpMethod.POST);
        this.setIsFormRequest(true);
        this.file = file;
    }

    getParams(): LicenseParams {
        return {
            license: this.file,
        };
    }

    protected parseResponse(response: Response): boolean {
        return !!response.getResult()['licenseValid'];
    }
}
