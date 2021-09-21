var admin = require('/lib/xp/admin');
var mustache = require('/lib/mustache');
var portal = require('/lib/xp/portal');

function handleGet() {
    var view = resolve('./main.html');

    var params = {
        adminUrl: admin.getBaseUri(),
        adminAssetsUri: admin.getAssetsUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        studioAssetsUri: portal.assetUrl({
            path: ''
        }).replace(/\.plus/g, ''),
        faviconsAssetsUri: portal.assetUrl({
            path: ''
        }).replace(/\.plus/g, ''),
        appName: 'Archive',
        appId: app.name,
        appVersion: app.version,
        locale: admin.getLocale(),
        launcherPath: admin.getLauncherPath(),
        launcherUrl: admin.getLauncherUrl(),
        services: {
            stylesUrl: portal.serviceUrl({service: 'styles'}),
            i18nUrl: portal.serviceUrl({service: 'i18n'}).replace(/\.plus/g, ''),
            contentServiceUrl: portal.serviceUrl({service: 'content'}),
            adminToolsUrl: portal.serviceUrl({service: 'admintools'}).replace(/\.plus/g, '')
        },
        mainUrl: portal.pageUrl({})
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
