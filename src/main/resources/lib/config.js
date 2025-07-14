/*global app, require*/

const admin = require('/lib/xp/admin');
const portal = require('/lib/xp/portal');
const authLib = require('/lib/xp/auth');
const i18n = require('/lib/xp/i18n');

const getPhrases = function (locales) {
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

const getConfig = (locales) => {
    const csAppName = 'com.enonic.app.contentstudio';
    const csToolUri = admin.getToolUrl(csAppName, 'main');
    const user = authLib.getUser();

    return {
        adminUrl: admin.getHomeToolUrl(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        branch: 'draft',
        appId: app.name,
        services: {
            contentUrl: portal.apiUrl({
                api: `${csAppName}:content`,
            }),
            licenseUrl: portal.apiUrl({
                api: 'license',
            }),
        },
        widgetApiUrl: portal.apiUrl({
            api: 'admin:widget',
        }),
        toolUri: csToolUri,
        phrasesAsJson: JSON.stringify(getPhrases(locales)),
        user,
        principals: authLib.getMemberships(user.key, true)
    };
}

exports.getConfig = getConfig;
