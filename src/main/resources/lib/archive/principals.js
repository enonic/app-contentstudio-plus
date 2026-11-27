const authLib = require('/lib/xp/auth');
const common = require('/lib/archive/common');

const CACHE_TTL_MS = common.CACHE_TTL_MS;

let principalNames = {names: {}, time: 0};

const resolvePrincipalNames = (keys) => {
    const names = {};

    keys.forEach((key) => {
        const name = getPrincipalName(key);
        if (name !== undefined) {
            names[key] = name;
        }
    });

    return names;
};

const getPrincipalName = (key) => {
    const now = Date.now();

    if (now - principalNames.time > CACHE_TTL_MS) {
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

exports.resolvePrincipalNames = resolvePrincipalNames;
exports.getPrincipalName = getPrincipalName;
