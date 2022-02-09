/*global app*/

const portal = require('/lib/xp/portal');

function handleGet() {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            assetsUri: portal.assetUrl({
                path: ''
            }),
            appId: app.name,
            services: {
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
                i18nUrlStudio: portal.serviceUrl({service: 'i18n', application: 'com.enonic.app.contentstudio'}),
                licenseUrl: portal.serviceUrl({service: 'license', application: 'com.enonic.app.contentstudio'})
            }
        }
    };
}

exports.get = handleGet;
