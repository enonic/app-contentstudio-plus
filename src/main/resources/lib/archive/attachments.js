const contentLib = require('/lib/xp/content');
const common = require('/lib/archive/common');
const notFound = common.notFound;

const DOWNLOAD_HEADERS = {
    'Cache-Control': 'private, no-store',
    'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'",
    'X-Content-Type-Options': 'nosniff',
};

const serveAttachment = (contentId, name) => {
    const attachments = contentLib.getAttachments(contentId) || {};
    const attachment = Object.prototype.hasOwnProperty.call(attachments, name) ? attachments[name] : null;
    const stream = attachment ? contentLib.getAttachmentStream({key: contentId, name}) : null;

    if (!stream) {
        return notFound();
    }

    const headers = {'Content-Disposition': makeContentDisposition(name)};
    Object.keys(DOWNLOAD_HEADERS).forEach((key) => {
        headers[key] = DOWNLOAD_HEADERS[key];
    });

    return {
        status: 200,
        contentType: attachment.mimeType || 'application/octet-stream',
        headers,
        body: stream,
    };
};

// The quoted name is an ascii fallback; the real name goes in `filename*`, as RFC 8187 has it.
const makeContentDisposition = (name) => {
    const fallback = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
    const encoded = encodeURIComponent(name).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

    return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

exports.serveAttachment = serveAttachment;
