const portal = require('/lib/xp/portal');
const mustache = require('/lib/mustache');

function handleGet() {
    const view = resolve('./archive.html');
    const params = {
        assetsUri: portal.assetUrl({
            path: 'js/archive.js'
        }),
        stylesUri: portal.assetUrl({
            path: 'styles/main.css'
        }),
        configServiceUrl: portal.serviceUrl({service: 'config'}),
        i18nServiceUrl: portal.serviceUrl({service: 'i18n'})
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params),
    };
}

exports.get = handleGet;
