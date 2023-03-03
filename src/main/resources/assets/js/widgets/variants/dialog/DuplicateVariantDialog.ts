import {ContentDuplicateDialog} from 'lib-contentstudio/app/duplicate/ContentDuplicateDialog';
import {AppHelper} from '../../../util/AppHelper';

export class DuplicateVariantDialog extends ContentDuplicateDialog {

    private static INSTANCE: DuplicateVariantDialog;

    static get(): DuplicateVariantDialog {
        if (!DuplicateVariantDialog.INSTANCE) {
            DuplicateVariantDialog.INSTANCE = new DuplicateVariantDialog();
        }

        return DuplicateVariantDialog.INSTANCE;
    }
}
