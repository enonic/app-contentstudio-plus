import {RequestError} from '@enonic/ui-utils';
import {requestJson} from '@enonic/ui-utils/request';
import {$config} from '../../../shared/config';

export function fetchHasValidLicense(): Promise<boolean> {
    return requestJson<{hasValidLicense?: boolean}>($config.get().services.licenseUrl).match(
        (json) => json.hasValidLicense === true,
        (error) => {
            throw error;
        },
    );
}

// `requestJson` serializes the body as JSON, the license goes as multipart.
export async function postLicense(file: File): Promise<boolean> {
    const body = new FormData();
    body.append('license', file);

    const response = await fetch($config.get().services.licenseUrl, {
        method: 'POST',
        headers: {Accept: 'application/json'},
        body,
    });
    if (!response.ok) {
        throw new RequestError(response.statusText || `Request failed with status ${response.status}`, response.status);
    }

    const json = await response.json() as {licenseValid?: boolean};
    return json.licenseValid === true;
}
