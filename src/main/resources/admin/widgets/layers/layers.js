/*global app*/

const portal = require('/lib/xp/portal');
const mustache = require('/lib/mustache');
const configLib = require('/lib/config');

function handleGet(req) {
    return renderWidgetView(req);
}

function renderWidgetView(req) {
    let contentId = req.params.contentId;

    if (!contentId && portal.getContent()) {
        contentId = portal.getContent()._id;
    }

    const view = resolve('layers.html');
    const params = {
        contentId: contentId || '',
        assetsUri: portal.assetUrl({
            path: ''
        }),
        configScriptId: 'layers-widget-config-json',
        configAsJson: JSON.stringify(configLib.getConfig(), null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1"),
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
