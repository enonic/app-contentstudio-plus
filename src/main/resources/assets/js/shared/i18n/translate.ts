import {fromPhrases, type Translate} from '@enonic/ui-utils';
import {$phrases} from './i18n.store';

export const translate: Translate = fromPhrases(() => $phrases.get());
