var assert = require('/lib/xp/testing');

var ARCHIVE_ROOT_PATH = '/archive';
var STUDIO_URL = '/admin/com.enonic.app.contentstudio/main';

var COLORABLE_SVG = '<svg><path fill="currentColor" stroke="none"/></svg>';
var COLORED_SVG = '<svg><path fill="currentColor"/><path fill="#ff0000"/></svg>';

var TYPES = {
    'myapp:article': {superType: 'base:structured', icon: {data: COLORABLE_SVG, mimeType: 'image/svg+xml', modifiedTime: '2026-01-01T00:00:00Z'}},
    'myapp:note': {superType: 'myapp:article'},
    'base:structured': {},
    'base:folder': {icon: {data: COLORED_SVG, mimeType: 'image/svg+xml', modifiedTime: '2026-02-02T00:00:00Z'}}
};

var contexts = [];
var queries = [];
var principalRequests = [];
var queryResults = [];

assert.mock('/lib/xp/context', {
    run: function (context, callback) {
        contexts.push(context);
        return callback();
    }
});

assert.mock('/lib/xp/content', {
    ARCHIVE_ROOT_PATH: ARCHIVE_ROOT_PATH,
    query: function (params) {
        queries.push(params);
        return queryResults.shift() || {total: 0, hits: [], aggregations: {}};
    },
    getType: function (name) {
        return TYPES[name] || null;
    },
    getAttachments: function (key) {
        return key === 'c' ? {'image "c" æ.png': {name: 'image "c" æ.png', mimeType: 'image/png'}} : null;
    },
    getAttachmentStream: function (params) {
        return 'stream of ' + params.key + '/' + params.name;
    }
});

assert.mock('/lib/xp/auth', {
    getPrincipal: function (key) {
        principalRequests.push(key);
        return key === 'user:system:known' ? {key: key, displayName: 'Known User'} : null;
    }
});

assert.mock('/lib/xp/admin', {
    getToolUrl: function () {
        return STUDIO_URL;
    }
});

assert.mock('/lib/xp/io', {
    readText: function (data) {
        return data;
    }
});

assert.mock('/lib/xp/portal', {
    apiUrl: function (params) {
        var query = Object.keys(params.params).map(function (key) {
            return key + '=' + encodeURIComponent(params.params[key]);
        });
        return params.baseUrl + '/_/' + params.api.split(':')[1] + '?' + query.join('&');
    }
});

assert.mock('/lib/xp/task', {
    get: function (taskId) {
        if (taskId === 'task-1') {
            return {id: taskId, application: app.name, state: 'FINISHED', progress: {info: 'done', current: 1, total: 1}};
        }
        return taskId === 'task-3' ? {id: taskId, application: 'com.other.app', state: 'RUNNING'} : null;
    }
});

var archiveApi = require('/apis/archive/archive');

function reset(results) {
    contexts = [];
    queries = [];
    principalRequests = [];
    queryResults = results || [];
}

function post(body, results) {
    reset(results);

    return archiveApi.post({
        body: typeof body === 'string' ? body : JSON.stringify(body),
        contentType: 'application/json; charset=UTF-8',
        locales: ['no']
    });
}

function search(body, results) {
    body.action = 'search';
    return post(body, results);
}

function get(params, results) {
    reset(results);
    return archiveApi.get({params: params});
}

function takeReports() {
    return String(__.newBean('com.enonic.xp.app.contentstudio.plus.archive.ArchiveApiTest$TaskProbe').takeReports()).split('\n');
}

function ids(items) {
    return items.map(function (item) {
        return item.id;
    });
}

function findItem(result, id) {
    return result.body.items.filter(function (item) {
        return item.id === id;
    })[0];
}

function findBucket(result, name, key) {
    var aggregation = result.body.aggregations.filter(function (current) {
        return current.name === name;
    })[0];

    return aggregation.buckets.filter(function (bucket) {
        return bucket.key === key;
    })[0];
}

exports.testInvalidBodyReturnsBadRequest = function () {
    assert.assertEquals(400, post('not json').status);
    assert.assertEquals(400, post({}).status);
    assert.assertEquals(400, post({action: 'search'}).status);
    assert.assertEquals(400, post({action: 'search', project: 'My Project'}).status);
    assert.assertEquals(400, post({action: 'get', project: '../system', ids: ['a']}).status);
    assert.assertEquals(400, post({action: 'unknown', project: 'myproject'}).status);
    assert.assertEquals(0, queries.length);
    assert.assertEquals(0, contexts.length);
};

exports.testBodyMustBeSentAsJson = function () {
    var body = JSON.stringify({action: 'delete', project: 'myproject', ids: ['a']});

    reset();
    assert.assertEquals(400, archiveApi.post({body: body, contentType: 'text/plain'}).status);
    assert.assertEquals(400, archiveApi.post({body: body, contentType: 'application/x-www-form-urlencoded'}).status);
    assert.assertEquals(400, archiveApi.post({body: body}).status);
    assert.assertEquals(0, contexts.length);
};

exports.testSearchRunsInArchiveOfProject = function () {
    var result = search({project: 'myproject', count: 10}, [
        {total: 5, hits: [{id: 'c', score: 1}, {id: 'missing', score: 1}, {id: 'a', score: 1}], aggregations: {}}
    ]);

    assert.assertEquals(200, result.status);
    assert.assertEquals(5, result.body.total);
    assert.assertJsonEquals(['c', 'a'], ids(result.body.items));
    assert.assertJsonEquals([], result.body.aggregations);

    assert.assertEquals(1, contexts.length);
    assert.assertEquals('com.enonic.cms.myproject', contexts[0].repository);
    assert.assertEquals('draft', contexts[0].branch);
    assert.assertEquals(ARCHIVE_ROOT_PATH, contexts[0].attributes.contentRootPath);

    assert.assertEquals(1, queries.length);
    assert.assertEquals(10, queries[0].count);
    assert.assertEquals('ids', queries[0].returns);
    assert.assertJsonEquals({matchAll: {}}, queries[0].query);
    assert.assertTrue(queries[0].filters === undefined);
    assert.assertTrue(queries[0].aggregations === undefined);
};

exports.testCountIsLimited = function () {
    search({project: 'myproject', count: 5000});
    assert.assertEquals(100, queries[0].count);

    search({project: 'myproject', count: -3});
    assert.assertEquals(0, queries[0].count);
};

exports.testTextIsSearchedByNameAndId = function () {
    search({project: 'myproject', text: '  my text  '});

    var should = queries[0].query.boolean.should;

    assert.assertEquals('my text', should[0].boolean.should[0].fulltext.query);
    assert.assertEquals('my text', should[0].boolean.should[1].ngram.query);
    assert.assertJsonEquals({field: '_id', value: 'my text'}, should[1].term);
};

exports.testSelectionBecomesFilters = function () {
    search({
        project: 'myproject',
        selection: {
            contentTypes: ['base:folder', 7],
            lang: ['no'],
            owner: [],
            unknown: ['x']
        }
    });

    assert.assertJsonEquals([
        {hasValue: {field: 'type', values: ['base:folder']}},
        {hasValue: {field: 'language', values: ['no']}}
    ], queries[0].filters);
};

exports.testAggregationWithSelectionIsCountedWithoutItsOwnFilter = function () {
    var result = search({
        project: 'myproject',
        aggregations: true,
        selection: {
            contentTypes: ['base:folder'],
            lang: ['no']
        }
    }, [
        {
            total: 1,
            hits: [],
            aggregations: {
                contentTypes: {buckets: [{key: 'base:folder', docCount: 1}]},
                archivedBy: {buckets: [{key: 'user:system:known', docCount: 1}]},
                owner: {buckets: []},
                lang: {buckets: [{key: 'no', docCount: 1}]}
            }
        },
        {total: 4, hits: [], aggregations: {contentTypes: {buckets: [{key: 'base:folder', docCount: 1}, {key: 'myapp:note', docCount: 3}]}}},
        {total: 6, hits: [], aggregations: {lang: {buckets: [{key: 'no', docCount: 1}, {key: 'en', docCount: 5}]}}}
    ]);

    assert.assertEquals(3, queries.length);
    assert.assertJsonEquals(['contentTypes', 'archivedBy', 'owner', 'lang'], Object.keys(queries[0].aggregations));

    assert.assertEquals(0, queries[1].count);
    assert.assertJsonEquals(['contentTypes'], Object.keys(queries[1].aggregations));
    assert.assertJsonEquals([{hasValue: {field: 'language', values: ['no']}}], queries[1].filters);

    assert.assertEquals(0, queries[2].count);
    assert.assertJsonEquals(['lang'], Object.keys(queries[2].aggregations));
    assert.assertJsonEquals([{hasValue: {field: 'type', values: ['base:folder']}}], queries[2].filters);

    assert.assertEquals(1, result.body.total);
    assert.assertEquals(3, findBucket(result, 'contentTypes', 'myapp:note').docCount);
    assert.assertEquals(5, findBucket(result, 'lang', 'en').docCount);
    assert.assertEquals(1, findBucket(result, 'archivedBy', 'user:system:known').docCount);
};

exports.testBucketsGetDisplayNames = function () {
    var result = search({project: 'myproject', aggregations: true}, [
        {
            total: 3,
            hits: [],
            aggregations: {
                contentTypes: {buckets: [{key: 'myapp:article', docCount: 2}, {key: 'myapp:note', docCount: 1}]},
                archivedBy: {buckets: [{key: 'user:system:known', docCount: 2}, {key: 'user:system:removed', docCount: 1}]},
                owner: {buckets: [{key: 'user:system:known', docCount: 3}]},
                lang: {buckets: [{key: 'no', docCount: 3}]}
            }
        }
    ]);

    assert.assertEquals('Artikkel', findBucket(result, 'contentTypes', 'myapp:article').displayName);
    assert.assertEquals('Note', findBucket(result, 'contentTypes', 'myapp:note').displayName);
    assert.assertEquals('Known User', findBucket(result, 'archivedBy', 'user:system:known').displayName);
    assert.assertTrue(findBucket(result, 'archivedBy', 'user:system:removed').displayName === undefined);
    assert.assertEquals('Known User', findBucket(result, 'owner', 'user:system:known').displayName);
    assert.assertTrue(findBucket(result, 'lang', 'no').displayName === undefined);
};

exports.testPrincipalNamesAreRequestedOnce = function () {
    var results = function () {
        return [
            {
                total: 1,
                hits: [],
                aggregations: {
                    archivedBy: {buckets: [{key: 'user:system:cached', docCount: 1}]},
                    owner: {buckets: [{key: 'user:system:cached', docCount: 1}]}
                }
            }
        ];
    };

    search({project: 'myproject', aggregations: true}, results());
    assert.assertJsonEquals(['user:system:cached'], principalRequests);

    search({project: 'myproject', aggregations: true}, results());
    assert.assertJsonEquals([], principalRequests);
};

exports.testPrincipalsReturnsNamesOfKnownKeys = function () {
    var result = post({action: 'principals', keys: ['user:system:known', 'user:system:gone', 5]});

    assert.assertEquals(200, result.status);
    assert.assertJsonEquals({'user:system:known': 'Known User'}, result.body.names);
    assert.assertEquals(0, contexts.length);
};

exports.testListRejectsInvalidParams = function () {
    assert.assertEquals(400, get({}).status);
    assert.assertEquals(400, get({project: 'My Project'}).status);
    assert.assertEquals(400, get({project: 'myproject', parentId: 'a b'}).status);
    assert.assertEquals(0, contexts.length);
};

exports.testListReturnsArchivedItems = function () {
    var result = get({project: 'myproject', from: '20', size: '10'}, [
        {total: 7, hits: [{id: 'a', score: 1}, {id: 'c', score: 1}]}
    ]);

    assert.assertEquals(200, result.status);
    assert.assertEquals(7, result.body.total);
    assert.assertJsonEquals(['a', 'c'], ids(result.body.items));

    assert.assertEquals(1, queries.length);
    assert.assertEquals('/', queries[0].parent);
    assert.assertEquals(20, queries[0].start);
    assert.assertEquals(10, queries[0].count);
    assert.assertEquals('ids', queries[0].returns);

    assert.assertEquals('com.enonic.cms.myproject', contexts[0].repository);
    assert.assertEquals(ARCHIVE_ROOT_PATH, contexts[0].attributes.contentRootPath);

    var folder = findItem(result, 'a');

    assert.assertEquals('folder-a', folder.name);
    assert.assertEquals('Folder A', folder.displayName);
    assert.assertEquals('/folder-a', folder.path);
    assert.assertEquals('base:folder', folder.type);
    assert.assertTrue(folder.hasChildren === true);
    assert.assertTrue(folder.isValid === true);
    assert.assertEquals('no', folder.language);
    assert.assertEquals('user:system:known', folder.owner);
    assert.assertEquals('user:system:known', folder.archivedBy);
    assert.assertEquals('2026-01-03T10:00:00Z', folder.archivedTime);
    assert.assertEquals('2026-01-02T10:00:00Z', folder.modifiedTime);
    assert.assertEquals('/site', folder.originalParentPath);
    assert.assertEquals('folder-original', folder.originalName);
    assert.assertEquals('READY', folder.workflow.state);
    assert.assertEquals('2026-01-01T12:00:00Z', folder.publish.first);
    assert.assertEquals(0, folder.childOrder.orderExpressions.length);
    assert.assertTrue(folder.thumbnail === undefined);
    assert.assertTrue(folder.isImage === undefined);

    assert.assertJsonEquals([], folder.attachments);

    assert.assertTrue(findItem(result, 'c').hasChildren === false);
    assert.assertJsonEquals(['image-c.png'], findItem(result, 'c').attachments);
};

exports.testListOfParentReturnsItsChildren = function () {
    var result = get({project: 'myproject', parentId: 'a', size: '5000'}, [
        {total: 1, hits: [{id: 'b', score: 1}]}
    ]);

    assert.assertEquals('a', queries[0].parent);
    assert.assertEquals(0, queries[0].start);
    assert.assertEquals(100, queries[0].count);
    assert.assertEquals(1, result.body.total);
    assert.assertJsonEquals(['b'], ids(result.body.items));
    assert.assertTrue(findItem(result, 'b').isValid === false);
};

exports.testGetKeepsTheOrderOfIds = function () {
    var result = post({action: 'get', project: 'myproject', ids: ['c', 'missing', 'b', 'x,y', 'a']});

    assert.assertEquals(200, result.status);
    assert.assertJsonEquals(['c', 'b', 'a'], ids(result.body.items));
    assert.assertEquals('com.enonic.cms.myproject', contexts[0].repository);
};

exports.testItemsGetIconUrls = function () {
    var result = post({action: 'get', project: 'myproject', ids: ['a', 'b', 'c', 'd']});

    assert.assertEquals(STUDIO_URL + '/_/archive?typeIcon=base%3Afolder&v=2026-02-02T00%3A00%3A00Z', findItem(result, 'a').iconUrl);
    assert.assertEquals(
        STUDIO_URL + '/_/archive?icon=b&project=myproject&v=2026-01-02T10%3A00%3A00Z',
        findItem(result, 'b').iconUrl
    );
    assert.assertEquals('image/png', findItem(result, 'b').thumbnail.mimeType);
    assert.assertTrue(findItem(result, 'c').iconUrl.indexOf(STUDIO_URL + '/_/archive?icon=c&project=myproject&v=') === 0);
    assert.assertEquals(
        STUDIO_URL + '/_/archive?typeIcon=myapp%3Anote&v=2026-01-01T00%3A00%3A00Z&colorable=true',
        findItem(result, 'd').iconUrl
    );
};

exports.testCompressedVectorIsServedWithItsEncoding = function () {
    var vector = get({project: 'myproject', icon: 'f'});
    var probe = __.newBean('com.enonic.xp.app.contentstudio.plus.archive.ArchiveApiTest$GzipProbe');

    assert.assertEquals(200, vector.status);
    assert.assertEquals('image/svg+xml', vector.contentType);
    assert.assertEquals('gzip', vector.headers['Content-Encoding']);
    assert.assertEquals('nosniff', vector.headers['X-Content-Type-Options']);
    assert.assertEquals('<svg xmlns="http://www.w3.org/2000/svg"/>', String(probe.read(vector.body)));
};

exports.testThumbnailAndImageAreServedScaled = function () {
    var image = get({project: 'myproject', icon: 'c'});

    assert.assertEquals(200, image.status);
    assert.assertEquals('image/png', image.contentType);
    assert.assertTrue(image.body.size() == 'scaled to 128'.length);
    assert.assertEquals(ARCHIVE_ROOT_PATH, contexts[0].attributes.contentRootPath);

    var thumbnail = get({project: 'myproject', icon: 'b'});

    assert.assertEquals(200, thumbnail.status);
    assert.assertEquals('image/png', thumbnail.contentType);
    assert.assertTrue(thumbnail.body.size() == 'scaled to 128'.length);

    assert.assertTrue(image.headers['Content-Encoding'] === undefined);

    assert.assertEquals(404, get({project: 'myproject', icon: 'a'}).status);
    assert.assertEquals(404, get({project: 'myproject', icon: 'e'}).status);
    assert.assertEquals(404, get({project: 'myproject', icon: 'missing'}).status);
    assert.assertEquals(400, get({project: 'myproject', icon: 'a b'}).status);
    assert.assertEquals(400, get({icon: 'b'}).status);
};

exports.testTypeIconIsServedWithTheIconOfSuperType = function () {
    var result = get({typeIcon: 'myapp:note'});

    assert.assertEquals(200, result.status);
    assert.assertEquals('image/svg+xml', result.contentType);
    assert.assertEquals(COLORABLE_SVG, result.body);

    assert.assertEquals(404, get({typeIcon: 'base:structured'}).status);
    assert.assertEquals(404, get({typeIcon: 'myapp:unknown'}).status);
    assert.assertEquals(400, get({typeIcon: 'not a type'}).status);
    assert.assertEquals(0, contexts.length);
};

exports.testDescendantsAreFoundByThePathsOfIds = function () {
    var result = post({action: 'descendants', project: 'myproject', ids: ['a', 'c']});

    assert.assertEquals(200, result.status);
    assert.assertJsonEquals(['b'], result.body.ids);
    assert.assertEquals(ARCHIVE_ROOT_PATH, contexts[0].attributes.contentRootPath);

    assert.assertJsonEquals([], post({action: 'descendants', project: 'myproject', ids: ['c']}).body.ids);
    assert.assertEquals(400, post({action: 'descendants', project: 'myproject', ids: []}).status);
    assert.assertEquals(400, post({action: 'descendants', project: 'myproject', ids: ['a', 'x,y']}).status);
    assert.assertEquals(400, post({action: 'descendants', ids: ['a']}).status);
};

exports.testRestoreRunsAsTask = function () {
    takeReports();

    var result = post({action: 'restore', project: 'myproject', ids: ['a', 'c', 'd']});

    assert.assertEquals(200, result.status);
    assert.assertEquals('task-1', result.body.taskId);
    assert.assertEquals(ARCHIVE_ROOT_PATH, contexts[0].attributes.contentRootPath);
    assert.assertJsonEquals([
        'Restore content',
        'Restoring content',
        '{"phase":"restore","count":4}',
        '1/4',
        '2/4',
        '{"state":"WARNING","message":"2 items have been restored. Item \\"note-d\\" could not be restored."}'
    ], takeReports());

    post({action: 'restore', project: 'myproject', ids: ['c']});
    assert.assertEquals('{"state":"SUCCESS","message":"Item \\"image-c.png\\" has been restored."}', takeReports().pop());

    post({action: 'restore', project: 'myproject', ids: ['missing']});
    assert.assertEquals('{"state":"WARNING","message":"Nothing was restored."}', takeReports().pop());

    assert.assertEquals(400, post({action: 'restore', project: 'myproject', ids: ['a b']}).status);
    assert.assertEquals(400, post({action: 'restore', project: 'myproject'}).status);
};

exports.testDeleteRunsAsTaskAndSkipsChildrenOfSelectedParents = function () {
    takeReports();

    var result = post({action: 'delete', project: 'myproject', ids: ['b', 'a', 'd']});

    assert.assertEquals('task-1', result.body.taskId);
    assert.assertJsonEquals([
        'Delete content',
        'Deleting content',
        '{"phase":"delete","count":3}',
        '1/3',
        '2/3',
        '{"state":"SUCCESS","message":"2 items have been deleted."}'
    ], takeReports());
};

exports.testAttachmentIsServedAsDownload = function () {
    var name = 'image "c" æ.png';
    var result = get({project: 'myproject', attachment: 'c', name: name});

    assert.assertEquals(200, result.status);
    assert.assertEquals('image/png', result.contentType);
    assert.assertEquals('stream of c/' + name, result.body);
    assert.assertEquals(
        'attachment; filename="image _c_ _.png"; filename*=UTF-8\'\'image%20%22c%22%20%C3%A6.png',
        result.headers['Content-Disposition']
    );
    assert.assertEquals('nosniff', result.headers['X-Content-Type-Options']);
    assert.assertEquals(ARCHIVE_ROOT_PATH, contexts[0].attributes.contentRootPath);

    assert.assertEquals(404, get({project: 'myproject', attachment: 'c', name: 'other.png'}).status);
    assert.assertEquals(404, get({project: 'myproject', attachment: 'a', name: name}).status);
    assert.assertEquals(404, get({project: 'myproject', attachment: 'c', name: 'toString'}).status);
    assert.assertEquals(400, get({project: 'myproject', attachment: 'a b', name: name}).status);
    assert.assertEquals(400, get({project: 'myproject', attachment: 'c'}).status);
    assert.assertEquals(400, get({attachment: 'c', name: name}).status);
};

exports.testTaskIsReadByItsIdInThePath = function () {
    var api = '/admin/com.enonic.app.contentstudio/main/_/com.enonic.app.contentstudio.plus:archive';
    var result = archiveApi.get({path: api + '/task-1', params: {}});

    assert.assertEquals(200, result.status);
    assert.assertEquals('FINISHED', result.body.state);
    assert.assertEquals('done', result.body.progress.info);

    assert.assertEquals(404, archiveApi.get({path: api + '/task-2', params: {}}).status);
    assert.assertEquals(404, archiveApi.get({path: api + '/task-3', params: {}}).status);
    assert.assertEquals(400, archiveApi.get({path: api, params: {}}).status);
    assert.assertEquals(400, archiveApi.get({path: api + '/', params: {}}).status);
};
