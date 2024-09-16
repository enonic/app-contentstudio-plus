/*global app*/

const portal = require('/lib/xp/portal');
const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const mustache = require('/lib/mustache');
const admin = require('/lib/xp/admin');


const defaultContainerId = 'cs-plus-widget-publish-report';

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
        isNoIdMode: true,
        containerId: defaultContainerId,
    }
}

const makeParams = (content, isArchived) => {
    return {
        contentId: content._id || '',
        stylesUri: portal.assetUrl({
            path: 'styles/widgets/publish-report.css'
        }),
        jsUri: portal.assetUrl({
            path: 'js/widgets/publish-report.js'
        }),
        configServiceUrl: `${admin.getToolUrl(app.name, 'main')}/_/${app.name}/config`,
        isNoIdMode: false,
        publishFirst: content.publish.first,
        isNormalMode: !!content.publish.first,
        isNoPublishMode: !content.publish.first,
        containerId: defaultContainerId + (isArchived ? '-archived' : ''),
        isArchived
    }
}

const doGetContent = (contentId) => {
    return contentLib.get({
        key: contentId
    });
}

const getContent = (contentId, repository) => {
    return contextLib.run({
            repository: repository
        }, () => doGetContent(contentId)
    );
}

const getContentFromArchive = (contentId, repository) => {
    return contextLib.run({
            repository: repository,
            attributes: {
                contentRootPath: __.newBean('com.enonic.xp.app.contentstudio.plus.AdminBean').getArchiveRootPath()
            }
        }, () => doGetContent(contentId)
    );
}

const getViewParams = (req) => {
    const contentId = getContentId(req);
    let isArchived = false;

    if (contentId) {
        let content = getContent(contentId, req.params.repository);
        if (!content) {
            content = getContentFromArchive(contentId, req.params.repository);
            if (content) {
                isArchived = true;
            }
        }

        if (content) {
            return makeParams(content, isArchived);
        }
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
