/*global app, __*/

const taskLib = require('/lib/xp/task');
const common = require('/lib/archive/common');
const ok = common.ok;
const notFound = common.notFound;

const TASK_ID = /^[\w-]+$/;

// A task is read at `<api url>/<task id>`; the api key itself has dots and a colon, so it is never taken for an id.
const findTaskId = (path) => {
    const value = typeof path === 'string' ? path : '';
    const tail = value.substring(value.lastIndexOf('/') + 1);

    return TASK_ID.test(tail) ? tail : undefined;
};

const startTask = (action, ids) => {
    const bean = __.newBean('com.enonic.xp.app.contentstudio.plus.archive.ArchiveTaskHandler');
    bean.setIds(ids.join(','));

    return {taskId: action === 'delete' ? bean.delete() : bean.restore()};
};

// Only the tasks this application started are shown.
const serveTask = (taskId) => {
    const task = taskLib.get(taskId);

    return task && task.application === app.name ? ok(task) : notFound();
};

exports.findTaskId = findTaskId;
exports.startTask = startTask;
exports.serveTask = serveTask;
