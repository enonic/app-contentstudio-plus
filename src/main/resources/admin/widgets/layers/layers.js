var portalLib = require('/lib/xp/portal');
var thymeleaf = require('/lib/thymeleaf');
var portal = require('/lib/xp/portal');
const license = require("/lib/license");

function handleGet(req) {
    if (isLicensePresentAndValid()) {
        return renderWidgetView(req);
    }

    return renderNoLicenseView();
}

function isLicensePresentAndValid() {
    const licenseDetail = license.validateLicense({
        appKey: app.name,
    });

    return !!licenseDetail && !licenseDetail.expired;
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
