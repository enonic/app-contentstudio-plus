/*global app, require*/

const portal = require('/lib/xp/portal');
const admin = require('/lib/xp/admin');
const i18n = require('/lib/xp/i18n');

const getPhrases = function () {
    const locales = admin.getLocales();
    const phrases = {};
    const bundles = ['i18n/common', 'i18n/common_wcag', 'i18n/phrases', 'i18n/dialogs', 'i18n/wcag', 'i18n/messages'];

    for (const bundleIndex in bundles) {
        const bundlePhrases = i18n.getPhrases(locales, [bundles[bundleIndex]]);
        for (const key in bundlePhrases) {
            phrases[key] = bundlePhrases[key]
        }
    }

    return phrases;
};

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
            contentUrl: portal.apiUrl({
                application: csAppName,
                api: 'content',
            }),
            licenseUrl: portal.apiUrl({
                application: csAppName,
                api: 'license',
            }),
        },
        widgetApiUrl: portal.apiUrl({
            application: 'admin',
            api: 'widget',
        }),
        toolUri: csToolUri,
        phrases: JSON.stringify(getPhrases(), null, 4),
    };
}

exports.getConfig = getConfig;
