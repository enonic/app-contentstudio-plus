import type {Request, Response} from '/types/';

// @ts-expect-error No types for /lib/mustache yet.
import {render} from '/lib/mustache';
import {assetUrl, getContent, serviceUrl} from '/lib/xp/portal';
import {getAdminUrl} from '/lib/app-contentstudio-plus/urlHelper';

const VIEW = resolve('layers.html');

export function get(req: Request): Response {
    let contentId = req.params.contentId;

    if (!contentId && getContent()) {
        contentId = getContent()._id;
    }

    const params = {
        assetsUri: assetUrl({
            path: ''
        }),
        configServiceUrl: serviceUrl({service: 'config'}),
        contentId: contentId || '',
        layersBundleUrl: getAdminUrl({
            path: 'widgets/layers/main.js'
        }, 'main')
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    };
}
