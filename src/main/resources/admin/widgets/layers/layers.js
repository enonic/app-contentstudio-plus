const portalLib = require('/lib/xp/portal');
const thymeleaf = require('/lib/thymeleaf');
const portal = require('/lib/xp/portal');

function handleGet(req) {
    return renderWidgetView(req);
}

function renderWidgetView(req) {
    let contentId = req.params.contentId;

    if (!contentId && portalLib.getContent()) {
        contentId = portalLib.getContent()._id;
    }

    const view = resolve('layers.html');
    const params = {
        contentId: contentId,
        repository: req.params.repository,
        i18nUrl: portal.serviceUrl({service: 'i18n'}),
    };

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, params)
    };
}

exports.get = handleGet;
