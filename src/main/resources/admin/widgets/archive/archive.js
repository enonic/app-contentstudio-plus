/*global app*/

const portal = require('/lib/xp/portal');
const mustache = require('/lib/mustache');
const configLib = require('/lib/config');

function handleGet() {
    const view = resolve('./archive.html');

    const params = {
        assetsUri: portal.assetUrl({
            path: 'js/archive.js'
        }),
        stylesUri: portal.assetUrl({
            path: 'styles/main.css'
        }),
        configScriptId: 'widget-archive-config-json',
        configAsJson: JSON.stringify(configLib.getConfig(), null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1"),
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params),
    };
}

exports.get = handleGet;
