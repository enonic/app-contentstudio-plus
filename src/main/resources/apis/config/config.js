/*global app*/

const portal = require('/lib/xp/portal');
const admin = require('/lib/xp/admin');

function handleGet() {
    const csToolUri = admin.getToolUrl('com.enonic.app.contentstudio', 'main');
    const serviceBaseUrl = `${csToolUri}/_/com.enonic.app.contentstudio`;
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: admin.getBaseUri(),
            assetsUri: portal.assetUrl({
                path: ''
            }),
            appId: app.name,
            services: {
                i18nUrl: `${admin.getToolUrl(app.name, 'main')}/_/${app.name}/i18n`,
                i18nUrlStudio: `${serviceBaseUrl}/i18n`,
                contentUrl: `${serviceBaseUrl}/content`,
                licenseUrl: `${serviceBaseUrl}/license`,
            },
            toolUri: csToolUri,
        }
    };
}

exports.get = handleGet;
