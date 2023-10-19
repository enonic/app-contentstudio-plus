import type {Response} from '/types/';

import {getLocales} from '/lib/xp/admin';
import {getPhrases as _getPhrases} from '/lib/xp/i18n';

export const get = (): Response => ({
    status: 200,
    contentType: 'application/json',
    body: getPhrases()
});

function getPhrases() {
    const locales = getLocales();
    const phrases = {};
    const bundles = ['i18n/phrases'];

    for (let bundle of bundles) { // TODO Does Nashorn support for-of?
        const bundlePhrases = _getPhrases(locales, [bundle]);
    // for (let i = 0; i < bundles.length; i++) { // eslint-disable-line @typescript-eslint/prefer-for-of
    //     const bundlePhrases = _getPhrases(locales, [bundles[i]]);
        for (const key in bundlePhrases) { phrases[key] = bundlePhrases[key]; }
    }

    return phrases;
}
