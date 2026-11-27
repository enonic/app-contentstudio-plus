const common = require('/lib/archive/common');
const attachmentsLib = require('/lib/archive/attachments');
const contentsLib = require('/lib/archive/contents');
const iconsLib = require('/lib/archive/icons');
const principalsLib = require('/lib/archive/principals');
const searchLib = require('/lib/archive/search');
const tasksLib = require('/lib/archive/tasks');

const MAX_PRINCIPALS = 100;
const JSON_TYPE = 'application/json';

const ok = common.ok;
const badRequest = common.badRequest;
const isProject = common.isProject;
const isContentId = common.isContentId;
const toStrings = common.toStrings;
const runInArchive = common.runInArchive;

exports.get = (req) => {
    const taskId = tasksLib.findTaskId(req.path);

    if (taskId) {
        return tasksLib.serveTask(taskId);
    }

    const params = req.params || {};

    if (params.typeIcon !== undefined) {
        return iconsLib.serveTypeIcon(params.typeIcon);
    }

    if (!isProject(params.project)) {
        return badRequest();
    }

    if (params.icon !== undefined) {
        return isContentId(params.icon) ? runInArchive(params.project, () => iconsLib.serveIcon(params.icon)) : badRequest();
    }

    if (params.attachment !== undefined) {
        const isValid = isContentId(params.attachment) && typeof params.name === 'string' && params.name.length > 0;
        const serve = () => attachmentsLib.serveAttachment(params.attachment, params.name);
        return isValid ? runInArchive(params.project, serve) : badRequest();
    }

    if (params.parentId !== undefined && !isContentId(params.parentId)) {
        return badRequest();
    }

    return ok(runInArchive(params.project, () => contentsLib.list(params)));
};

exports.post = (req) => {
    const body = isJson(req.contentType) ? parseBody(req.body) : null;

    if (!body) {
        return badRequest();
    }

    if (body.action === 'principals') {
        return ok({names: principalsLib.resolvePrincipalNames(toStrings(body.keys).slice(0, MAX_PRINCIPALS))});
    }

    if (!isProject(body.project)) {
        return badRequest();
    }

    if (body.action === 'get') {
        const ids = toStrings(body.ids).filter(isContentId).slice(0, common.MAX_COUNT);
        return ok(runInArchive(body.project, () => ({items: contentsLib.getByIds(ids, body.project)})));
    }

    if (body.action === 'descendants' || body.action === 'delete' || body.action === 'restore') {
        const ids = toStrings(body.ids);

        if (ids.length === 0 || !ids.every(isContentId)) {
            return badRequest();
        }

        const run = () => (body.action === 'descendants' ? contentsLib.findDescendantIds(ids) : tasksLib.startTask(body.action, ids));
        return ok(runInArchive(body.project, run));
    }

    if (body.action === 'search') {
        const params = searchLib.parseSearchParams(body);
        return ok(runInArchive(params.project, () => searchLib.search(params, (req.locales || []).join(','))));
    }

    return badRequest();
};

// A cross-site form cannot send this content type without a preflight.
const isJson = (contentType) => typeof contentType === 'string' && contentType.toLowerCase().indexOf(JSON_TYPE) === 0;

const parseBody = (body) => {
    try {
        const json = JSON.parse(body);
        return json && typeof json === 'object' ? json : null;
    } catch (e) {
        return null;
    }
};
