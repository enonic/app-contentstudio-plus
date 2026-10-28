import {atom} from 'nanostores';
import {parseConfig, type PlusConfig} from './config';

export const $config = atom<PlusConfig>(parseConfig({}));

export function setConfig(config: PlusConfig): void {
    $config.set(config);
}
