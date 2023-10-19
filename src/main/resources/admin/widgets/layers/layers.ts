import type {Request, Response} from '/types/';

// @ts-expect-error No types for /lib/mustache yet.
import {render} from '/lib/mustache';
import {assetUrl, getContent, serviceUrl} from '/lib/xp/portal';

const VIEW = resolve('layers.html');

export function get(req: Request): Response {
    let contentId = req.params.contentId;

    if (!contentId && getContent()) {
        contentId = getContent()._id;
    }

    const params = {
        contentId: contentId || '',
        assetsUri: assetUrl({
            path: ''
        }),
        configServiceUrl: serviceUrl({service: 'config'})
    };

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    };
}
