const portalLib = require('/lib/xp/portal');
const thymeleaf = require('/lib/thymeleaf');
const portal = require('/lib/xp/portal');
const licenseManager = require("/lib/license-manager");

function handleGet(req) {
    const licenseValid = licenseManager.isCurrentLicenseValid();
    if (licenseValid) {
        return renderWidgetView(req);
    }

    return renderNoLicenseView();
}

function renderWidgetView(req) {
    let contentId = req.params.contentId;

    if (!contentId && portalLib.getContent()) {
        contentId = portalLib.getContent()._id;
    }

    if (!contentId) {
        return {
            contentType: 'text/html',
            body: '<widget class="error">Select an item - and we\'ll show you the details!</widget>'
        };
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

function renderNoLicenseView() {
    const licenseView = resolve("license.html");
    const assetsUrl = portal.assetUrl({
        path: "",
    });
    const licenseUrl = portal.serviceUrl({
        service: "license",
        type: "absolute",
    });

    return {
        contentType: 'text/html',
        body: thymeleaf.render(licenseView, {assetsUrl, licenseUrl}),
    };
}

exports.get = handleGet;
