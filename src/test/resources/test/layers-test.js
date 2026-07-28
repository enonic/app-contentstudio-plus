var assert = require('/lib/xp/testing');

assert.mock('/lib/xp/context', {
    run: function (context, callback) {
        return callback();
    }
});

assert.mock('/lib/xp/project', {
    list: function () {
        return [
            {
                id: 'myproject',
                displayName: 'My Project'
            }
        ];
    }
});

assert.mock('/lib/xp/content', {
    get: function (params) {
        return {
            _id: params.key,
            _name: 'my-content',
            displayName: 'My Content'
        };
    }
});

var layersApi = require('/apis/layers/layers');

exports.testGetReturnsCompareAndPublishStatus = function () {
    var result = layersApi.get({
        params: {
            contentId: 'abc',
            project: 'myproject'
        }
    });

    assert.assertEquals(200, result.status);

    var projects = result.body.projects;
    assert.assertEquals(1, projects.length);

    var entry = projects[0];
    assert.assertEquals('myproject', entry.project.id);
    assert.assertEquals('abc', entry.item._id);
    assert.assertEquals('NEW', entry.compareAndPublishStatus.compareStatus);
    assert.assertEquals('ONLINE', entry.compareAndPublishStatus.publishStatus);
};

exports.testGetMissingParamsReturnsBadRequest = function () {
    var result = layersApi.get({
        params: {}
    });

    assert.assertEquals(400, result.status);
};
