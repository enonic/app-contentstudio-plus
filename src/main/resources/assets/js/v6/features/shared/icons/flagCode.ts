const NONE = 'none';
const UNKNOWN = 'unknown';

const NO_FLAG = [
    'agq', 'asa', 'ast', 'bas', 'bez', 'brx', 'ccp', 'cgg', 'chr', 'ckb', 'dav', 'dje', 'kea', 'khq', 'kok', 'lag', 'lkt',
    'lrc', 'luo', 'luy', 'mas', 'mer', 'mgh', 'mua', 'mzn', 'nus', 'prg', 'rof', 'rwk', 'sah', 'saq', 'sbp', 'shi', 'smn',
    'twq', 'tzm', 'vai', 'af', 'bm', 'bs', 'ca', 'cu', 'ee', 'eu', 'gl', 'ki', 'kw', 'om', 'se',
];

// Language codes whose flag is not the country with the same two letters.
const NONSTANDARD_CODES: Readonly<Record<string, string>> = {
    ...Object.fromEntries(NO_FLAG.map((code) => [code, NONE])),
    'ar-sa': 'sa',
    'ast-es': 'es',
    'af-na': 'na',
    'af-za': 'za',
    'an-as': 'ws',
    'bm-ml': 'ml',
    'ca-ad': 'ad',
    'cy-gb': 'gb',
    'da-gl': 'gl',
    'de-at': 'at',
    'de-be': 'be',
    'de-ch': 'ch',
    'de-lu': 'lu',
    'en-au': 'au',
    'en-bm': 'bm',
    'en-bb': 'bb',
    'en-bs': 'bs',
    'en-bw': 'bw',
    'en-cm': 'cm',
    'en-ca': 'ca',
    'en-us': 'us',
    'mgh-mz': 'mz',
    bem: 'za',
    fil: 'ph',
    gsw: 'sw',
    mfe: 'mu',
    be: 'by',
    br: 'fr',
    cs: 'cz',
    cy: 'gb-wls',
    da: 'dk',
    el: 'gr',
    en: 'gb',
    et: 'ee',
    ga: 'ie',
    gd: 'gb-sct',
    he: 'il',
    hi: 'in',
    ja: 'jp',
    ko: 'kr',
    ma: 'ms',
    sg: 'cf',
    sq: 'al',
    sr: 'rs',
    sv: 'se',
    uk: 'ua',
    zh: 'cn',
};

export type FlagCode = {
    /** Two letters shown when there is no flag image. */
    code: string;
    /** Class of the `flag-icons` package. */
    className: string;
};

export function resolveFlagCode(language: string): FlagCode {
    const fullCode = language.toLowerCase();
    const shortCode = fullCode.slice(0, 2);
    const classCode =
        NONSTANDARD_CODES[fullCode] ?? NONSTANDARD_CODES[fullCode.slice(0, 3)] ?? NONSTANDARD_CODES[shortCode] ?? shortCode;
    const isCountryCode = classCode !== NONE && classCode.length <= 2;

    return {
        code: isCountryCode ? classCode : shortCode,
        className: `fi-${classCode || UNKNOWN}`,
    };
}
