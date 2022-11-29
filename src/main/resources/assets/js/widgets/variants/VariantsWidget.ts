import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import * as Q from 'q';
import {GetContentVariantsRequest} from './resource/request/GetContentVariantsRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {CreateVariantDialog} from './dialog/CreateVariantDialog';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {VariantsList} from './ui/list/VariantsList';

export class VariantsWidget
    extends Widget {

    private static INSTANCE: VariantsWidget;

    private createVariantsButton?: Button;

    private originalContent: ContentSummaryAndCompareStatus;

    private content: ContentSummaryAndCompareStatus;

    private variants: ContentSummaryAndCompareStatus[];

    private variantsList: VariantsList;

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
        this.fetchData().then(() => {
            this.displayVariants();
            return Q.resolve();
        }).catch((e: Error) => {
            DefaultErrorHandler.handle(e);
            this.handleErrorWhileLoadingVariants();
        }).finally(() => this.loadMask.hide());
    }

    private fetchData(): Q.Promise<void> {
        return this.fetchContent().then(() => this.fetchVariants());
    }

    private fetchContent(): Q.Promise<void> {
        return new ContentSummaryAndCompareStatusFetcher().fetch(new ContentId(this.contentId)).then(
            (content: ContentSummaryAndCompareStatus) => {
                this.content = content;

                if (this.content.isVariant()) {
                    const id: ContentId = new ContentId(this.content.getContentSummary().getVariantOf());
                    return new ContentSummaryAndCompareStatusFetcher().fetch(id).then((original: ContentSummaryAndCompareStatus) => {
                        this.originalContent = original;
                    });
                }

                this.originalContent = content;
                return Q.resolve();
            });
    }

    private fetchVariants(): Q.Promise<void> {
        return new GetContentVariantsRequest(this.originalContent.getId()).fetchWithCompareStatus().then(
            (variants: ContentSummaryAndCompareStatus[]) => {
                this.variants = variants;
                return Q.resolve();
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

        if (!this.variantsList) {
            this.variantsList = new VariantsList();
            this.appendChild(this.variantsList);
        }

        this.variantsList.update(this.originalContent, this.variants).setActiveItemById(this.contentId);
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
