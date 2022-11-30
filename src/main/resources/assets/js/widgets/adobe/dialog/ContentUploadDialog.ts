import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import * as Q from 'q';

export class ContentUploadDialog
    extends ModalDialog {

    private static INSTANCE: ContentUploadDialog;

    private createAction: Action;

    private constructor() {
        super({
            class: 'widget-adobe-content-upload-dialog',
            title: 'Upload content to Adobe Target',
        });
    }

    static get(): ContentUploadDialog {
        if (!ContentUploadDialog.INSTANCE) {
            ContentUploadDialog.INSTANCE = new ContentUploadDialog();
        }

        return ContentUploadDialog.INSTANCE;
    }

    protected initElements(): void {
        super.initElements();

        this.createAction = new Action('Upload Content (1)');
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addAction(this.createAction);
            return rendered;
        });
    }

}
