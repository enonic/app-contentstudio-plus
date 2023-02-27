import {ContentDuplicateDialog} from 'lib-contentstudio/app/duplicate/ContentDuplicateDialog';
import {AppHelper} from '../../../util/AppHelper';

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

    getUriPropertyName(): string {
        return AppHelper.STUDIO_URI_PROPERTY_NAME;
    }
}
