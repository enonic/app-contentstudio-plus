/*global app*/

const portal = require('/lib/xp/portal');
const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const i18n = require('/lib/xp/i18n');
const mustache = require('/lib/mustache');
const configLib = require('/lib/config');

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

const getBaseParams = (locales) => {
    return {
        stylesUri: portal.assetUrl({
            path: 'styles/extensions/publish-report.css'
        }),
        jsUri: portal.assetUrl({
            path: 'js/extensions/publish-report.js'
        }),
        configScriptId: 'pr-extension-config-json',
        configAsJson: JSON.stringify(configLib.getConfig(locales), null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1"),
        isNoPublishMode: false,
        isArchived: false,
        contentId: '',
        publishFirst: ''
    }
}

const doGetContent = (contentId) => {
    return contentLib.get({
        key: contentId
    });
}

const getContent = (contentId, repository) => {
    return contextLib.run({
            repository: repository,
            branch: 'draft'
        }, () => doGetContent(contentId)
    );
}

const getContentFromArchive = (contentId, repository) => {
    return contextLib.run({
            repository: repository,
            branch: 'draft',
            attributes: {
                contentRootPath: __.newBean('com.enonic.xp.app.contentstudio.plus.AdminBean').getArchiveRootPath()
            }
        }, () => doGetContent(contentId)
    );
}

const getViewParams = (req) => {
    const params = getBaseParams(req.locales);

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
            params.isArchived = isArchived;
            params.contentId = content._id;
            params.publishFirst = content.publish.first;
            params.isNoPublishMode = !content.publish.first;
            params.neverPublishedError = i18n.localize({
                key: 'widget.publishReport.neverPublished',
                bundles: ['i18n/cs-plus']
            })
        }
    }

    return params;
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
