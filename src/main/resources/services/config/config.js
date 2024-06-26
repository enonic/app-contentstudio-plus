/*global app*/

const portal = require('/lib/xp/portal');
const admin = require('/lib/xp/admin');

function handleGet() {
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
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
                i18nUrlStudio: portal.serviceUrl({service: 'i18n', application: 'com.enonic.app.contentstudio'}),
                contentUrl: portal.serviceUrl({service: 'content', application: 'com.enonic.app.contentstudio'}),
                licenseUrl: portal.serviceUrl({service: 'license', application: 'com.enonic.app.contentstudio'})
            },
            toolUri: admin.getToolUrl('com.enonic.app.contentstudio', 'main')
        }
    };
}

exports.get = handleGet;
