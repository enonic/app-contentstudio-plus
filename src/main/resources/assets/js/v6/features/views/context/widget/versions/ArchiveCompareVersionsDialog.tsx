import {LegacyElement} from '@enonic/lib-contentstudio/v6/shared/ui/LegacyElement';
import {CompareVersionsDialog}
    from '@enonic/lib-contentstudio/v6/widgets/context-panel/widget/versions/compare/CompareVersionsDialog';

export class ArchiveCompareVersionsDialogElement
    extends LegacyElement<typeof CompareVersionsDialog, Record<string, never>> {

    constructor() {
        super({}, CompareVersionsDialog);
    }
}
