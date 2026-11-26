var assert = require('/lib/xp/testing');

var ARCHIVE_ROOT_PATH = '/archive';

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
    }
});

assert.mock('/lib/xp/auth', {
    getPrincipal: function (key) {
        principalRequests.push(key);
        return key === 'user:system:known' ? {key: key, displayName: 'Known User'} : null;
    }
});

var archiveApi = require('/apis/archive/archive');

function post(body, results) {
    contexts = [];
    queries = [];
    principalRequests = [];
    queryResults = results || [];

    return archiveApi.post({
        body: typeof body === 'string' ? body : JSON.stringify(body),
        locales: ['no']
    });
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
    assert.assertEquals(400, post({project: 'My Project'}).status);
    assert.assertEquals(400, post({project: '../system'}).status);
    assert.assertEquals(0, queries.length);
};

exports.testSearchRunsInArchiveOfProject = function () {
    var result = post({project: 'myproject', count: 10}, [
        {total: 2, hits: [{id: 'a', score: 1}, {id: 'b', score: 1}], aggregations: {}}
    ]);

    assert.assertEquals(200, result.status);
    assert.assertEquals(2, result.body.total);
    assert.assertJsonEquals(['a', 'b'], result.body.ids);
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
    post({project: 'myproject', count: 5000});
    assert.assertEquals(100, queries[0].count);

    post({project: 'myproject', count: -3});
    assert.assertEquals(0, queries[0].count);
};

exports.testTextIsSearchedByNameAndId = function () {
    post({project: 'myproject', text: '  my text  '});

    var should = queries[0].query.boolean.should;

    assert.assertEquals('my text', should[0].boolean.should[0].fulltext.query);
    assert.assertEquals('my text', should[0].boolean.should[1].ngram.query);
    assert.assertJsonEquals({field: '_id', value: 'my text'}, should[1].term);
};

exports.testSelectionBecomesFilters = function () {
    post({
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
    var result = post({
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
    var result = post({project: 'myproject', aggregations: true}, [
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

    post({project: 'myproject', aggregations: true}, results());
    assert.assertJsonEquals(['user:system:cached'], principalRequests);

    post({project: 'myproject', aggregations: true}, results());
    assert.assertJsonEquals([], principalRequests);
};
