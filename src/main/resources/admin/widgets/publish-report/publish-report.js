const portal = require('/lib/xp/portal');
const contentLib = require('/lib/xp/content');
const mustache = require('/lib/mustache');

const handleGet = (req) => {
    return renderWidgetView(req);
}

const getContentId = (req) => {
    let contentId = req.params.contentId;

    if (!contentId && portal.getContent()) {
        contentId = portal.getContent()._id;
    }

    return contentId;
}

const makeParamsNoContentId = () => {
    return {
        isNoIdMode: true
    }
}

const makeParamsNoAnyPublish = () => {
    return {
        isNoPublishMode: true
    }
}

const makeParams = (contentId) => {
    return {
        isNormalMode: true,
        contentId: contentId || '',
        stylesUri: portal.assetUrl({
            path: 'styles/widgets/publish-report.css'
        }),
        jsUri: portal.assetUrl({
            path: 'js/widgets/publish-report.js'
        }),
        configServiceUrl: portal.serviceUrl({service: 'config'})
    }
}

const getViewParams = (req) => {
    const contentId = getContentId(req);

    if (contentId) {
        const content = contentLib.get({key: contentId});

        if (content.publish.first) {
            return makeParams(contentId);
        }

        return makeParamsNoAnyPublish();
    }

    return makeParamsNoContentId();
}


const renderWidgetView = (req) => {
    const view = resolve('publish-report.html');
    const params = getViewParams(req);

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
