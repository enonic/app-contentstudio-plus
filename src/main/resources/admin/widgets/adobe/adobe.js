const portal = require('/lib/xp/portal');
const mustache = require('/lib/mustache');

function handleGet(req) {
    return renderWidgetView(req);
}

function renderWidgetView(req) {
    let contentId = req.params.contentId;

    if (!contentId && portal.getContent()) {
        contentId = portal.getContent()._id;
    }

    const view = resolve('adobe.html');
    const params = {
        contentId: contentId || '',
        assetsUri: portal.assetUrl({
            path: ''
        }),
        configServiceUrl: portal.serviceUrl({service: 'config'})
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
