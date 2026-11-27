const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');

const REPO_PREFIX = 'com.enonic.cms.';
const BRANCH = 'draft';
const PROJECT_NAME = /^[a-z0-9][a-z0-9_-]*$/;
const CONTENT_ID = /^[\w.:-]+$/;
const MAX_COUNT = 100;
const CACHE_TTL_MS = 60000;

const ok = (body) => ({
    status: 200,
    contentType: 'application/json',
    headers: {
        'Cache-Control': 'no-store',
    },
    body,
});

const badRequest = () => ({
    status: 400,
    contentType: 'text/plain',
    body: 'Invalid request',
});

const notFound = () => ({
    status: 404,
    contentType: 'text/plain',
    body: 'Not found',
});

const isProject = (value) => typeof value === 'string' && PROJECT_NAME.test(value);

const isContentId = (value) => typeof value === 'string' && CONTENT_ID.test(value);

const toStrings = (values) => (Array.isArray(values) ? values.filter((value) => typeof value === 'string') : []);

const toCount = (value) => {
    const count = Number(value);
    return count > 0 ? Math.min(Math.floor(count), MAX_COUNT) : 0;
};

const runInArchive = (project, callback) => {
    return contextLib.run(
        {
            repository: REPO_PREFIX + project,
            branch: BRANCH,
            attributes: {
                contentRootPath: contentLib.ARCHIVE_ROOT_PATH,
            },
        },
        callback
    );
};

exports.MAX_COUNT = MAX_COUNT;
exports.CACHE_TTL_MS = CACHE_TTL_MS;
exports.ok = ok;
exports.badRequest = badRequest;
exports.notFound = notFound;
exports.isProject = isProject;
exports.isContentId = isContentId;
exports.toStrings = toStrings;
exports.toCount = toCount;
exports.runInArchive = runInArchive;
