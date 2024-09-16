var i18n = require('/lib/xp/i18n');
var admin = require('/lib/xp/admin');

exports.get = function () {

    return {
        status: 200,
        contentType: 'application/json',
        body: getPhrases()
    }
};

var getPhrases = function() {
    const locales = admin.getLocales();
    const phrases = {};
    const bundles = ['i18n/phrases'];

    for (const bundleIndex in bundles) {
        const bundlePhrases = i18n.getPhrases(locales, [bundles[bundleIndex]]);
        for (const key in bundlePhrases) { phrases[key] = bundlePhrases[key] }
    }

    return phrases;
};
