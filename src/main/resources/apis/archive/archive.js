const authLib = require('/lib/xp/auth');
const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');

const REPO_PREFIX = 'com.enonic.cms.';
const PROJECT_NAME = /^[a-z0-9][a-z0-9_-]*$/;
const MAX_COUNT = 100;
const TYPE_TITLES_TTL_MS = 60000;
const PRINCIPAL_NAMES_TTL_MS = 60000;

const TEXT_FIELDS = ['displayName^5', '_name^3', '_allText'];
const SORT = [{field: '_score'}, {field: '_path', direction: 'ASC'}];

const AGGREGATIONS = [
    {name: 'contentTypes', field: 'type'},
    {name: 'archivedBy', field: 'archivedBy', principal: true},
    {name: 'owner', field: 'owner', principal: true},
    {name: 'lang', field: 'language'},
];

const typeTitlesByLocales = {};
let principalNames = {names: {}, time: 0};

exports.post = (req) => {
    const params = parseParams(req.body);

    if (!params) {
        return {
            status: 400,
            contentType: 'text/plain',
            body: 'Invalid request body',
        };
    }

    return {
        status: 200,
        contentType: 'application/json',
        headers: {
            'Cache-Control': 'no-store',
        },
        body: runInArchive(params.project, () => search(params, (req.locales || []).join(','))),
    };
};

const parseParams = (body) => {
    let json;

    try {
        json = JSON.parse(body);
    } catch (e) {
        return null;
    }

    if (!json || typeof json.project !== 'string' || !PROJECT_NAME.test(json.project)) {
        return null;
    }

    const selection = {};
    AGGREGATIONS.forEach((aggregation) => {
        const values = json.selection ? json.selection[aggregation.name] : null;
        selection[aggregation.name] = Array.isArray(values) ? values.filter((value) => typeof value === 'string') : [];
    });

    const count = Number(json.count);

    return {
        project: json.project,
        text: typeof json.text === 'string' ? json.text.trim() : '',
        selection,
        count: count > 0 ? Math.min(Math.floor(count), MAX_COUNT) : 0,
        aggregations: json.aggregations === true,
    };
};

const runInArchive = (project, callback) => {
    return contextLib.run(
        {
            repository: REPO_PREFIX + project,
            branch: 'draft',
            attributes: {
                contentRootPath: contentLib.ARCHIVE_ROOT_PATH,
            },
        },
        callback
    );
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
        ids: result.hits.map((hit) => hit.id),
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

const getPrincipalName = (key) => {
    const now = Date.now();

    if (now - principalNames.time > PRINCIPAL_NAMES_TTL_MS) {
        principalNames = {names: {}, time: now};
    }

    const names = principalNames.names;

    if (!Object.prototype.hasOwnProperty.call(names, key)) {
        names[key] = loadPrincipalName(key);
    }

    return names[key];
};

const loadPrincipalName = (key) => {
    try {
        const principal = authLib.getPrincipal(key);
        return principal ? principal.displayName : undefined;
    } catch (e) {
        return undefined;
    }
};

const getTypeTitles = (locales) => {
    const now = Date.now();
    const cached = typeTitlesByLocales[locales];

    if (cached && now - cached.time <= TYPE_TITLES_TTL_MS) {
        return cached.titles;
    }

    const bean = __.newBean('com.enonic.xp.app.contentstudio.plus.archive.ContentTypeTitlesHandler');
    bean.setLocales(locales);
    const titles = __.toNativeObject(bean.getTitles());

    typeTitlesByLocales[locales] = {titles, time: now};

    return titles;
};
