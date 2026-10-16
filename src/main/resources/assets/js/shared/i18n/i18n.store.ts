import {setPhrases as setStudioPhrases} from '@enonic/lib-contentstudio/v6/shared/i18n';
import type {Phrases} from '@enonic/ui-utils';
import {atom} from 'nanostores';

export const $phrases = atom<Phrases>({});

export function setPhrases(phrases: Phrases): void {
    $phrases.set(phrases);
    setStudioPhrases(phrases);
}
