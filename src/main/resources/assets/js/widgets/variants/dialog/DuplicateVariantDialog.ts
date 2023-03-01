import {ContentDuplicateDialog} from 'lib-contentstudio/app/duplicate/ContentDuplicateDialog';
import {ContentWizardPanelParams} from 'lib-contentstudio/app/wizard/ContentWizardPanelParams';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';


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

    protected getWizardParams(content: ContentSummary): ContentWizardPanelParams {
        return super.getWizardParams(content).setUriPropertyName('studioToolUri');
    }
}
