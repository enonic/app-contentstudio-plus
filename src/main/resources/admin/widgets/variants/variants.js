/*global app*/

const portal = require('/lib/xp/portal');
const mustache = require('/lib/mustache');
const admin = require('/lib/xp/admin');

function handleGet(req) {
    return renderWidgetView(req);
}

function renderWidgetView(req) {
    let contentId = req.params.contentId;

    if (!contentId && portal.getContent()) {
        contentId = portal.getContent()._id;
    }

    const view = resolve('variants.html');
    const params = {
        contentId: contentId || '',
        assetsUri: portal.assetUrl({
            path: ''
        }),
        configServiceUrl: `${admin.getToolUrl(app.name, 'main')}/_/${app.name}/config`,
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
