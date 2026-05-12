import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import {CompareVersionsDialog}
    from '@enonic/lib-contentstudio/v6/features/views/context/widget/versions/compare/CompareVersionsDialog';

export class ArchiveCompareVersionsDialogElement
    extends LegacyElement<typeof CompareVersionsDialog, Record<string, never>> {

    constructor() {
        super({}, CompareVersionsDialog);
    }
}
