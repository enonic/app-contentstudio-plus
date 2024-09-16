/*global app*/

const portal = require('/lib/xp/portal');
const mustache = require('/lib/mustache');
const admin = require('/lib/xp/admin');

function handleGet() {
    const view = resolve('./archive.html');
    const serviceBaseUrl = `${admin.getToolUrl(app.name, 'main')}/_/${app.name}`;
    const params = {
        assetsUri: portal.assetUrl({
            path: 'js/archive.js'
        }),
        stylesUri: portal.assetUrl({
            path: 'styles/main.css'
        }),
        configServiceUrl: `${serviceBaseUrl}/config`,
        i18nServiceUrl: `${serviceBaseUrl}/i18n`,
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params),
    };
}

exports.get = handleGet;
