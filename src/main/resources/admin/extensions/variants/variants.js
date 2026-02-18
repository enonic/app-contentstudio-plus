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

    const view = resolve('variants.html');
    const params = {
        contentId: contentId || '',
        stylesUri: portal.assetUrl({
            path: 'styles/widgets/variants.css'
        }),
        jsUri: portal.assetUrl({
            path: 'js/widgets/variants.js',
            params: {
                dt: Date.now().toString()
            }
        }),
        configScriptId: 'variants-widget-config-json',
        configAsJson: JSON.stringify(configLib.getConfig(req.locales), null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1")
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
