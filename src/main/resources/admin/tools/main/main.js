var admin = require('/lib/xp/admin');
var mustache = require('/lib/mustache');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/xp/context');

function handleGet() {
    var view = resolve('./main.html');

    var params = {
        adminUrl: admin.getBaseUri(),
        adminAssetsUri: admin.getAssetsUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        appName: 'Content Studio Plus',
        appId: app.name,
        appVersion: app.version,
        locale: admin.getLocale(),
        launcherPath: admin.getLauncherPath(),
        launcherUrl: admin.getLauncherUrl(),
        services: {
            stylesUrl: portal.serviceUrl({service: 'styles'}),
            i18nUrl: portal.serviceUrl({service: 'i18n'}),
            contentServiceUrl: portal.serviceUrl({service: 'content'})
        },
        mainUrl: portal.pageUrl({})
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
