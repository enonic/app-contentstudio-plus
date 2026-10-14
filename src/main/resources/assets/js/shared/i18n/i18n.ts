import {localize, type PhraseValue} from '@enonic/ui-utils';
import {$phrases} from './i18n.store';

export function i18n(key: string, ...values: PhraseValue[]): string {
    return localize($phrases.get(), key, ...values);
}
