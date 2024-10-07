import {JSONObject} from '@enonic/lib-admin-ui/types';

export const resolveConfig = (scriptId): JSONObject => {
    const scriptEl: HTMLElement = document.getElementById(scriptId);
    if (!scriptEl) {
        throw Error('Could not widget config');
    }
    return JSON.parse(scriptEl.innerText) as JSONObject;
}
