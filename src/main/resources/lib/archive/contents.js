/*global __*/

const contentLib = require('/lib/xp/content');
const common = require('/lib/archive/common');
const toCount = common.toCount;
const iconsLib = require('/lib/archive/icons');
const withIconUrls = iconsLib.withIconUrls;

const ROOT_PATH = '/';

const newContentsBean = () => __.newBean('com.enonic.xp.app.contentstudio.plus.archive.ArchiveContentsHandler');

const list = (params) => {
    const from = Number(params.from);
    const result = contentLib.query({
        parent: params.parentId === undefined ? ROOT_PATH : params.parentId,
        start: from > 0 ? Math.floor(from) : 0,
        count: toCount(params.size),
        returns: 'ids',
    });

    return {
        items: getByIds(result.hits.map((hit) => hit.id), params.project),
        total: result.total,
    };
};

const getByIds = (ids, project) => {
    if (ids.length === 0) {
        return [];
    }

    const bean = newContentsBean();
    bean.setIds(ids.join(','));

    const found = {};
    withIconUrls(__.toNativeObject(bean.getByIds()).items, project).forEach((item) => {
        found[item.id] = item;
    });

    return ids.map((id) => found[id]).filter((item) => !!item);
};

const findDescendantIds = (ids) => {
    const bean = newContentsBean();
    bean.setIds(ids.join(','));

    return {ids: __.toNativeObject(bean.getDescendantIds()).ids || []};
};

exports.list = list;
exports.getByIds = getByIds;
exports.findDescendantIds = findDescendantIds;
