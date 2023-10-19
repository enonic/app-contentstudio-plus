import type {Request, Response} from '/types/';

// @ts-expect-error No types for /lib/mustache yet.
import {render} from '/lib/mustache';
import {assetUrl, getContent as getCurrentContent, serviceUrl} from '/lib/xp/portal';
import {get as getContentByKey} from '/lib/xp/content';

const VIEW = resolve('publish-report.html');

export function get(req: Request): Response {
    let contentId = req.params.contentId;

    if (!contentId && getCurrentContent()) {
        contentId = getCurrentContent()._id;
    }

    let params;
    if (contentId) {
        const content = getContentByKey({key: contentId});
        params = {
            contentId: content._id || '',
            stylesUri: assetUrl({
                path: 'styles/widgets/publish-report.css'
            }),
            jsUri: assetUrl({
                path: 'js/widgets/publish-report.js'
            }),
            configServiceUrl: serviceUrl({service: 'config'}),
            isNoIdMode: false,
            publishFirst: content.publish.first,
            isNormalMode: !!content.publish.first,
            isNoPublishMode: !content.publish.first
        };
    } else {
        params = {
            isNoIdMode: true
        };
    }

    return {
        contentType: 'text/html',
        body: render(VIEW, params)
    };
}
