const adminLib = require('/lib/xp/admin');
const contentLib = require('/lib/xp/content');
const ioLib = require('/lib/xp/io');
const portalLib = require('/lib/xp/portal');
const common = require('/lib/archive/common');

const CACHE_TTL_MS = common.CACHE_TTL_MS;
const BRANCH = common.BRANCH;

const STUDIO_APP = 'com.enonic.app.contentstudio';
const MAX_SUPER_TYPES = 10;
const ICON_SCALE = 'square(128)';
const STUDIO_REST_PATH = '/rest-v2/cs';
const SVG_MIME_TYPE = 'image/svg+xml';
const SVG_PAINT = '(?:fill|stroke|stop-color|flood-color|lighting-color|color)\\s*[=:]\\s*["\']?\\s*([^"\';)]+)';
const SVG_NEUTRAL_PAINTS = ['none', 'currentcolor', 'inherit', 'transparent'];

let typeIcons = {icons: {}, time: 0};

const withIconUrls = (items, project) => {
    const urls = {
        project,
        studio: adminLib.getToolUrl(STUDIO_APP, 'main'),
        rest: String(adminLib.getHomeToolUrl()).replace(/\/+$/, '') + STUDIO_REST_PATH,
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

// The icons are still served by Content Studio, at the urls its own content list gives.
const resolveIconUrl = (item, urls) => {
    try {
        if (item.thumbnail) {
            const time = new Date(item.modifiedTime).getTime();
            return `${urls.rest}/cms/${urls.project}/archive/content/icon/${item.id}?ts=${time || 0}`;
        }

        if (item.isImage) {
            return portalLib.imageUrl({
                id: item.id,
                scale: ICON_SCALE,
                project: urls.project,
                branch: BRANCH,
                baseUrl: urls.studio,
            });
        }

        return makeTypeIconUrl(item.type, urls.rest);
    } catch (e) {
        return undefined;
    }
};

const makeTypeIconUrl = (typeName, restUrl) => {
    const icon = getTypeIcon(typeName);

    if (!icon) {
        return undefined;
    }

    const params = [];

    if (icon.version) {
        params.push(`hash=${encodeURIComponent(icon.version)}`);
    }
    if (icon.colorable) {
        params.push('colorable=true');
    }

    return `${restUrl}/schema/content/icon/${typeName}${params.length > 0 ? `?${params.join('&')}` : ''}`;
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

exports.withIconUrls = withIconUrls;
