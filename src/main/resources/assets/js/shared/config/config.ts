import type {Phrases} from '@enonic/ui-utils';

export interface PlusConfig {
    appId: string;
    adminUrl: string;
    services: {
        contentUrl: string;
        licenseUrl: string;
        layersUrl: string;
    };
    user: {
        key: string;
    };
    phrases: Phrases;
}

export interface RawConfig {
    [key: string]: unknown;
    appId?: unknown;
    adminUrl?: unknown;
    services?: Record<string, unknown>;
    user?: {key?: unknown};
    phrasesAsJson?: unknown;
}

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

export function readConfigScript(scriptId: string): RawConfig {
    const scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
        throw Error(`Missing config script #${scriptId}`);
    }
    return JSON.parse(scriptEl.textContent ?? '') as RawConfig;
}

export function parseConfig(raw: RawConfig): PlusConfig {
    const phrasesAsJson = toString(raw.phrasesAsJson);

    return {
        appId: toString(raw.appId),
        adminUrl: toString(raw.adminUrl),
        services: {
            contentUrl: toString(raw.services?.contentUrl),
            licenseUrl: toString(raw.services?.licenseUrl),
            layersUrl: toString(raw.services?.layersUrl),
        },
        user: {
            key: toString(raw.user?.key),
        },
        phrases: phrasesAsJson ? JSON.parse(phrasesAsJson) as Phrases : {},
    };
}
