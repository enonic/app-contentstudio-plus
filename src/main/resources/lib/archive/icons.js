/*global app, __*/

const adminLib = require('/lib/xp/admin');
const contentLib = require('/lib/xp/content');
const ioLib = require('/lib/xp/io');
const portalLib = require('/lib/xp/portal');
const common = require('/lib/archive/common');

const CACHE_TTL_MS = common.CACHE_TTL_MS;
const badRequest = common.badRequest;
const notFound = common.notFound;

const STUDIO_APP = 'com.enonic.app.contentstudio';
const TYPE_NAME = /^[\w.-]+:[\w.-]+$/;
const MAX_SUPER_TYPES = 10;
const ICON_SIZE = 128;
const ICON_HEADERS = {
    'Cache-Control': 'private, max-age=86400',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'X-Content-Type-Options': 'nosniff',
};
const GZIPPED_ICON_HEADERS = {
    'Cache-Control': ICON_HEADERS['Cache-Control'],
    'Content-Security-Policy': ICON_HEADERS['Content-Security-Policy'],
    'X-Content-Type-Options': ICON_HEADERS['X-Content-Type-Options'],
    'Content-Encoding': 'gzip',
};
const SVG_MIME_TYPE = 'image/svg+xml';
const SVG_PAINT = '(?:fill|stroke|stop-color|flood-color|lighting-color|color)\\s*[=:]\\s*["\']?\\s*([^"\';)]+)';
const SVG_NEUTRAL_PAINTS = ['none', 'currentcolor', 'inherit', 'transparent'];

let typeIcons = {icons: {}, time: 0};

const makeApiUrl = (baseUrl, params) => portalLib.apiUrl({api: `${app.name}:archive`, baseUrl, params});

const withIconUrls = (items, project) => {
    const urls = {
        project,
        studio: adminLib.getToolUrl(STUDIO_APP, 'main'),
    };

    return (items || []).map((item) => {
        const iconUrl = resolveIconUrl(item, urls);
        delete item.isImage;

        if (iconUrl) {
            item.iconUrl = iconUrl;
        }

        return item;
    });
};

const resolveIconUrl = (item, urls) => {
    try {
        if (item.thumbnail || item.isImage) {
            return makeApiUrl(urls.studio, {icon: item.id, project: urls.project, v: item.modifiedTime || ''});
        }

        return makeTypeIconUrl(item.type, urls.studio);
    } catch (e) {
        return undefined;
    }
};

const makeTypeIconUrl = (typeName, baseUrl) => {
    const icon = getTypeIcon(typeName);

    if (!icon) {
        return undefined;
    }

    const params = {typeIcon: typeName};

    if (icon.version) {
        params.v = icon.version;
    }
    if (icon.colorable) {
        params.colorable = 'true';
    }

    return makeApiUrl(baseUrl, params);
};

const getTypeIcon = (typeName) => {
    const now = Date.now();

    if (now - typeIcons.time > CACHE_TTL_MS) {
        typeIcons = {icons: {}, time: now};
    }

    const icons = typeIcons.icons;

    if (!Object.prototype.hasOwnProperty.call(icons, typeName)) {
        const icon = findTypeIcon(typeName);
        icons[typeName] = icon ? {version: icon.modifiedTime ? String(icon.modifiedTime) : undefined, colorable: isColorable(icon)} : null;
    }

    return icons[typeName];
};

// A type without an icon of its own shows the icon of the nearest super type that has one.
const findTypeIcon = (typeName) => {
    let type = contentLib.getType(typeName);
    let depth = 0;

    while (type && !type.icon && type.superType && depth < MAX_SUPER_TYPES) {
        type = contentLib.getType(type.superType);
        depth++;
    }

    return type && type.icon ? type.icon : null;
};

// The client paints an svg icon with the text colour when every paint in it is `currentColor` or paints nothing.
const isColorable = (icon) => {
    if (icon.mimeType !== SVG_MIME_TYPE) {
        return false;
    }

    const svg = String(ioLib.readText(icon.data)).toLowerCase();

    if (svg.indexOf('currentcolor') < 0) {
        return false;
    }

    const paint = new RegExp(SVG_PAINT, 'g');
    let match = paint.exec(svg);

    while (match) {
        if (SVG_NEUTRAL_PAINTS.indexOf(match[1].trim()) < 0) {
            return false;
        }
        match = paint.exec(svg);
    }

    return true;
};

const serveTypeIcon = (typeName) => {
    if (typeof typeName !== 'string' || !TYPE_NAME.test(typeName)) {
        return badRequest();
    }

    const icon = findTypeIcon(typeName);

    if (!icon) {
        return notFound();
    }

    return {
        status: 200,
        contentType: icon.mimeType,
        headers: ICON_HEADERS,
        body: icon.data,
    };
};

const serveIcon = (contentId) => {
    const bean = __.newBean('com.enonic.xp.app.contentstudio.plus.archive.ArchiveIconHandler');
    bean.setContentId(contentId);
    bean.setSize(ICON_SIZE);

    if (!bean.load()) {
        return notFound();
    }

    return {
        status: 200,
        contentType: bean.getMimeType(),
        headers: bean.isGzipped() ? GZIPPED_ICON_HEADERS : ICON_HEADERS,
        body: bean.getData(),
    };
};

exports.withIconUrls = withIconUrls;
exports.serveTypeIcon = serveTypeIcon;
exports.serveIcon = serveIcon;
