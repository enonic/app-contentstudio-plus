import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import * as Q from 'q';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {GetContentVariantsRequest} from './resource/request/GetContentVariantsRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {CreateVariantDialog} from './dialog/CreateVariantDialog';

export class VariantsWidget
    extends Widget {

    private static INSTANCE: VariantsWidget;

    private createVariantsButton: Button;

    constructor() {
        super(AppHelper.getVariantsWidgetClass());
    }

    static get(): VariantsWidget {
        if (!VariantsWidget.INSTANCE) {
            VariantsWidget.INSTANCE = new VariantsWidget();
        }

        return VariantsWidget.INSTANCE;
    }

    setContentId(contentId: string): void {
        super.setContentId(contentId);

        if (!this.contentId) {
            this.handleNoSelectedItem();
            return;
        }

        this.loadMask.show();

        this.displayVariants().catch(DefaultErrorHandler.handle).finally(() => this.loadMask.hide());
    }

    private displayVariants(): Q.Promise<void> {
        return this.fetchVariants().then((variants: ContentSummary[]) => {
           if (variants.length > 0) {
               this.showExistingVariants();
           } else {
               this.showCreateVariantsButton();
           }
        });
    }

    private showExistingVariants(): void {
        //
    }

    private showCreateVariantsButton(): void {
        if (!this.createVariantsButton) {
            this.createVariantsButton = this.initCreateVariantsButton();
            this.appendChild(this.createVariantsButton);
        }

        this.createVariantsButton.show();
    }

    private initCreateVariantsButton(): Button {
        const button: Button = new Button(i18n('widget.variants.button.create'));
        button.addClass('variants-widget-button-create');

        button.onClicked(() => {
           new CreateVariantDialog().open();
        });

        return button;
    }

    private fetchVariants(): Q.Promise<ContentSummary[]> {
        return new GetContentVariantsRequest(this.contentId).sendAndParse();
    }
}
