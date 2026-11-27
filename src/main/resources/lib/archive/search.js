/*global __*/

const contentLib = require('/lib/xp/content');
const common = require('/lib/archive/common');

const CACHE_TTL_MS = common.CACHE_TTL_MS;
const toStrings = common.toStrings;
const toCount = common.toCount;
const contentsLib = require('/lib/archive/contents');
const getByIds = contentsLib.getByIds;
const principalsLib = require('/lib/archive/principals');
const getPrincipalName = principalsLib.getPrincipalName;

const TEXT_FIELDS = ['displayName^5', '_name^3', '_allText'];
const SORT = [{field: '_score'}, {field: '_path', direction: 'ASC'}];
const AGGREGATIONS = [
    {name: 'contentTypes', field: 'type'},
    {name: 'archivedBy', field: 'archivedBy', principal: true},
    {name: 'owner', field: 'owner', principal: true},
    {name: 'lang', field: 'language'},
];

const typeTitlesByLocales = {};

const parseSearchParams = (json) => {
    const selection = {};
    AGGREGATIONS.forEach((aggregation) => {
        selection[aggregation.name] = toStrings(json.selection ? json.selection[aggregation.name] : null);
    });

    return {
        project: json.project,
        text: typeof json.text === 'string' ? json.text.trim() : '',
        selection,
        count: toCount(json.count),
        aggregations: json.aggregations === true,
    };
};

const search = (params, locales) => {
    const result = contentLib.query({
        start: 0,
        count: params.count,
        returns: 'ids',
        query: makeQuery(params.text),
        filters: makeFilters(params.selection),
        sort: SORT,
        aggregations: params.aggregations ? makeAggregations(AGGREGATIONS) : undefined,
    });

    return {
        items: getByIds(result.hits.map((hit) => hit.id), params.project),
        total: result.total,
        aggregations: params.aggregations ? AGGREGATIONS.map((aggregation) => resolveAggregation(aggregation, params, result, locales)) : [],
    };
};

const makeQuery = (text) => {
    if (!text) {
        return {
            matchAll: {},
        };
    }

    return {
        boolean: {
            should: [
                {
                    boolean: {
                        should: [
                            {
                                fulltext: {
                                    fields: TEXT_FIELDS,
                                    query: text,
                                    operator: 'AND',
                                },
                            },
                            {
                                ngram: {
                                    fields: TEXT_FIELDS,
                                    query: text,
                                    operator: 'AND',
                                },
                            },
                        ],
                    },
                },
                {
                    term: {
                        field: '_id',
                        value: text,
                    },
                },
            ],
        },
    };
};

const makeFilters = (selection, excludedName) => {
    const filters = AGGREGATIONS
        .filter((aggregation) => aggregation.name !== excludedName && selection[aggregation.name].length > 0)
        .map((aggregation) => ({
            hasValue: {
                field: aggregation.field,
                values: selection[aggregation.name],
            },
        }));

    return filters.length > 0 ? filters : undefined;
};

const makeAggregations = (aggregations) => {
    const result = {};

    aggregations.forEach((aggregation) => {
        result[aggregation.name] = {
            terms: {
                field: aggregation.field,
                order: '_count desc',
                size: 0,
            },
        };
    });

    return result;
};

// The buckets of an aggregation with a selection are counted as if nothing was selected in it.
const resolveAggregation = (aggregation, params, result, locales) => {
    const hasSelection = params.selection[aggregation.name].length > 0;
    const source = hasSelection ? queryAggregation(aggregation, params) : result;
    const buckets = source.aggregations[aggregation.name] ? source.aggregations[aggregation.name].buckets : [];

    return {
        name: aggregation.name,
        buckets: (buckets || []).map((bucket) => ({
            key: bucket.key,
            docCount: bucket.docCount,
            displayName: resolveDisplayName(aggregation, bucket.key, locales),
        })),
    };
};

const queryAggregation = (aggregation, params) => {
    return contentLib.query({
        start: 0,
        count: 0,
        returns: 'ids',
        query: makeQuery(params.text),
        filters: makeFilters(params.selection, aggregation.name),
        aggregations: makeAggregations([aggregation]),
    });
};

const resolveDisplayName = (aggregation, key, locales) => {
    if (aggregation.principal) {
        return getPrincipalName(key);
    }

    if (aggregation.name === 'contentTypes') {
        return getTypeTitles(locales)[key.toLowerCase()];
    }

    return undefined;
};

const getTypeTitles = (locales) => {
    const now = Date.now();
    const cached = typeTitlesByLocales[locales];

    if (cached && now - cached.time <= CACHE_TTL_MS) {
        return cached.titles;
    }

    const bean = __.newBean('com.enonic.xp.app.contentstudio.plus.archive.ContentTypeTitlesHandler');
    bean.setLocales(locales);
    const titles = __.toNativeObject(bean.getTitles());

    typeTitlesByLocales[locales] = {titles, time: now};

    return titles;
};

exports.parseSearchParams = parseSearchParams;
exports.search = search;
