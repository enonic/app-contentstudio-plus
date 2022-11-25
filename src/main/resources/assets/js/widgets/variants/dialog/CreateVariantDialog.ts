import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class CreateVariantDialog
    extends ModalDialog {

    constructor() {
        super({
            class: 'create-variant-dialog',
            title: i18n('widget.variants.dialog.create.title'),
        });
    }
}
