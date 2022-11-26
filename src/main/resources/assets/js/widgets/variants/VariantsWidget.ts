import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import * as Q from 'q';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {GetContentVariantsRequest} from './resource/request/GetContentVariantsRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {CreateVariantDialog} from './dialog/CreateVariantDialog';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';

export class VariantsWidget
    extends Widget {

    private static INSTANCE: VariantsWidget;

    private createVariantsButton?: Button;

    private originalContent?: ContentSummaryAndCompareStatus;

    private variants: ContentSummary[];

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

        this.loadDataAndUpdateWidgetContent();
    }

    private loadDataAndUpdateWidgetContent(): void {
        Q.all([this.fetchOriginalContent(), this.fetchVariants()]).then(() => {
            this.displayVariants();
        }).catch((e: Error) => {
            DefaultErrorHandler.handle(e);
            this.handleErrorWhileLoadingVariants();
        }).finally(() => this.loadMask.hide());
    }

    private fetchOriginalContent(): Q.Promise<void> {
        return new ContentSummaryAndCompareStatusFetcher().fetch(new ContentId(this.contentId)).then(
            (content: ContentSummaryAndCompareStatus) => {
                this.originalContent = content;
            });
    }

    private fetchVariants(): Q.Promise<void> {
        return new GetContentVariantsRequest(this.contentId).sendAndParse().then((variants: ContentSummary[]) => {
            this.variants = variants;
        });
    }

    private displayVariants(): void {
        if (this.variants.length > 0) {
            this.showExistingVariants();
        } else {
            this.showCreateVariantsButton();
        }
    }

    private showExistingVariants(): void {
        this.createVariantsButton?.hide();
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
           CreateVariantDialog.get().setContent(this.originalContent).setVariants(this.variants).open();
        });

        return button;
    }

    private handleErrorWhileLoadingVariants(): void {
        //
    }
}
