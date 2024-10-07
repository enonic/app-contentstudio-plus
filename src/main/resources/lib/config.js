/*global app, require*/

const portal = require('/lib/xp/portal');
const admin = require('/lib/xp/admin');

const getConfig = () => {
    const csAppName = 'com.enonic.app.contentstudio';
    const csToolUri = admin.getToolUrl(csAppName, 'main');

    return {
        adminUrl: admin.getBaseUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        appId: app.name,
        services: {
            i18nUrl: portal.apiUrl({
                application: app.name,
                api: 'i18n',
            }),
            i18nUrlStudio: portal.apiUrl({
                application: csAppName,
                api: 'i18n',
            }),
            contentUrl: portal.apiUrl({
                application: csAppName,
                api: 'content',
            }),
            licenseUrl: portal.apiUrl({
                application: csAppName,
                api: 'license',
            }),
        },
        toolUri: csToolUri,
    };
}

exports.getConfig = getConfig;
