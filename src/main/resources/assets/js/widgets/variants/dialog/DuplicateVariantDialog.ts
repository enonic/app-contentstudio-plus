import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {ContentDuplicateDialog} from 'lib-contentstudio/app/duplicate/ContentDuplicateDialog';
import {ContentWindowHelper} from './ContentWindowHelper';

export class DuplicateVariantDialog extends ContentDuplicateDialog {

    private static INSTANCE: DuplicateVariantDialog;

    private constructor() {
        super();
    }

    static get(): DuplicateVariantDialog {
        if (!DuplicateVariantDialog.INSTANCE) {
            DuplicateVariantDialog.INSTANCE = new DuplicateVariantDialog();
        }

        return DuplicateVariantDialog.INSTANCE;
    }

    protected openTabOnDuplicate(content: ContentSummary): void {
        new ContentWindowHelper(content.getId()).openEditWizard();
    }
}