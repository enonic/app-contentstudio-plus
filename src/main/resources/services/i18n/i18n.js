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
    var locales = admin.getLocales();
    var phrases = i18n.getPhrases(locales, ['i18n/layers']);

    return phrases;
};
