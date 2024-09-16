/*global app*/

const admin = require('/lib/xp/admin');
const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const i18n = require('/lib/xp/i18n');

function handleGet() {
    const view = resolve('./main.html');
    const locales = admin.getLocales();
    const toolUrlBase = admin.getToolUrl(app.name, 'main');

    const params = {
        appName: i18n.localize({
            key: 'app.archive',
            bundles: ['i18n/phrases'],
            locale: locales
        }),
        appId: app.name,
        assetsUri: portal.assetUrl({
            path: ''
        }),
        studioAssetsUri: portal.assetUrl({
            path: '',
            application: 'com.enonic.app.contentstudio'
        }),
        configServiceUrl: `${toolUrlBase}/_/${app.name}/config`,
        launcherPath: admin.getLauncherPath(),
        toolBaseUrl: toolUrlBase,
        toolAppName: app.name,
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
