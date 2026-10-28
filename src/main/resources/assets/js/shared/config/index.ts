import {parseConfig, readConfigScript, type PlusConfig} from './config';
import {setConfig} from './config.store';
import {initLegacyConfig} from './legacy';

export type {PlusConfig} from './config';
export {$config} from './config.store';

export function initConfig(scriptId: string): PlusConfig {
    const raw = readConfigScript(scriptId);
    const config = parseConfig(raw);
    setConfig(config);
    initLegacyConfig(scriptId, raw);
    return config;
}
