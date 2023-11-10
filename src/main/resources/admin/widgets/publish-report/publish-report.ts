import type {Request, Response} from '/types/';

// @ts-expect-error No types for /lib/mustache yet.
import {render} from '/lib/mustache';
import {assetUrl, getContent as getCurrentContent, serviceUrl} from '/lib/xp/portal';
import {get as getContentByKey} from '/lib/xp/content';
import {getAdminUrl} from '/lib/app-contentstudio-plus/urlHelper';

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
            configServiceUrl: serviceUrl({service: 'config'}),
            contentId: content._id || '',
            isNoIdMode: false,
            isNoPublishMode: !content.publish.first,
            isNormalMode: !!content.publish.first,
            publishFirst: content.publish.first,
            publishReportBundleUrl: getAdminUrl({
                path: 'widgets/publish-report/main.js'
            }, 'main'),
            stylesUri: assetUrl({
                path: 'styles/widgets/publish-report.css'
            })
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
