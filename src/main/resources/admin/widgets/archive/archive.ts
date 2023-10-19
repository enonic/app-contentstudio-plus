import type {Request, Response} from '/types/';

// @ts-expect-error No types for /lib/mustache yet.
import {render} from '/lib/mustache';
import {assetUrl, serviceUrl} from '/lib/xp/portal';
import {getAdminUrl} from '/lib/app-contentstudio-plus/urlHelper';

const VIEW = resolve('./archive.html');

export function get(): Response {
    const params = {
        archiveBundleUrl: getAdminUrl({
            path: 'archive.js'
        }, 'main'),
        stylesUri: assetUrl({
            path: 'styles/main.css'
        }),
        configServiceUrl: serviceUrl({service: 'config'}),
        i18nServiceUrl: serviceUrl({service: 'i18n'})
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params),
    };
}
