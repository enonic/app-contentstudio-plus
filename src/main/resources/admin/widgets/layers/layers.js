var portalLib = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');


function handleGet(req) {

    var contentId = req.params.contentId;

    if (!contentId && portalLib.getContent()) {
        contentId = portalLib.getContent()._id;
    }

    if (!contentId) {
        return {
            contentType: 'text/html',
            body: '<widget class="error">Select an item - and we\'ll show you the details!</widget>'
        };
    }

    var view = resolve('layers.html');
    var params = {
        contentId: contentId,
        repository: req.params.repository
    };

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, params)
    };
}
exports.get = handleGet;
