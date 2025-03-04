/*global app, require*/

const admin = require('/lib/xp/admin');
const portal = require('/lib/xp/portal');
const contextLib = require('/lib/xp/context');
const authLib = require('/lib/xp/auth');
const i18n = require('/lib/xp/i18n');

const getPhrases = function () {
    const locales = admin.getLocales();
    const phrases = {};
    const bundles = ['i18n/cs-plus'];

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
    const context = contextLib.get();
    const user = authLib.getUser();

    return {
        adminUrl: admin.getBaseUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        branch: context.branch,
        appId: app.name,
        services: {
            contentUrl: portal.apiUrl({
                application: csAppName,
                api: 'content',
            }),
            licenseUrl: portal.apiUrl({
                api: 'license',
            }),
        },
        widgetApiUrl: portal.apiUrl({
            application: 'admin',
            api: 'widget',
        }),
        toolUri: csToolUri,
        phrasesAsJson: JSON.stringify(getPhrases()),
        user,
        principals: authLib.getMemberships(user.key, true)
    };
}

exports.getConfig = getConfig;
