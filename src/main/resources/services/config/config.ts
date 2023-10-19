import {getBaseUri, getToolUrl} from '/lib/xp/admin';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

export function get() {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: getBaseUri(),
            assetsUri: assetUrl({
                path: ''
            }),
            appId: app.name,
            services: {
                i18nUrl: serviceUrl({service: 'i18n'}),
                i18nUrlStudio: serviceUrl({service: 'i18n', application: 'com.enonic.app.contentstudio'}),
                contentUrl: serviceUrl({service: 'content', application: 'com.enonic.app.contentstudio'}),
                licenseUrl: serviceUrl({service: 'license', application: 'com.enonic.app.contentstudio'})
            },
            toolUri: getToolUrl('com.enonic.app.contentstudio', 'main')
        }
    };
}
