import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import Q from 'q';
import {GetContentVariantsRequest} from './resource/request/GetContentVariantsRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {CreateVariantDialog} from './dialog/CreateVariantDialog';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {VariantsList} from './ui/list/VariantsList';
import {ContentServerEventsHandler} from 'lib-contentstudio/app/event/ContentServerEventsHandler';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {ContentServerChangeItem} from 'lib-contentstudio/app/event/ContentServerChangeItem';

export class VariantsWidget
    extends Widget {

    private static INSTANCE: VariantsWidget;

    private createVariantsButton?: Button;

    private originalContent: ContentSummaryAndCompareStatus;

    private content: ContentSummaryAndCompareStatus;

    private variants: ContentSummaryAndCompareStatus[];

    private variantsList: VariantsList;

    private contentDuplicatedListener: (items: ContentSummaryAndCompareStatus[]) => void;

    private contentDeletedListener: (items: ContentServerChangeItem[]) => void;

    constructor() {
        super(AppHelper.getVariantsWidgetClass());
    }

    static get(): VariantsWidget {
        if (!VariantsWidget.INSTANCE) {
            VariantsWidget.INSTANCE = new VariantsWidget();
        }

        return VariantsWidget.INSTANCE;
    }

    protected initElements(): void {
        super.initElements();

        this.contentDuplicatedListener = this.handeContentDuplicated.bind(this);
        this.contentDeletedListener = this.handleContentDeleted.bind(this);
    }

    protected initListeners(): void {
        super.initListeners();

        ContentServerEventsHandler.getInstance().onContentDuplicated(this.contentDuplicatedListener);
        ContentServerEventsHandler.getInstance().onContentDeleted(this.contentDeletedListener);
    }

    private handeContentDuplicated(duplicatedItems: ContentSummaryAndCompareStatus[]): void {
        if (this.isInDOM() && this.isAnyItemDuplicated(duplicatedItems)) {
            this.loadDataAndUpdateWidgetContent();
            NotifyManager.get().showFeedback(i18n('widget.variants.event.create', this.originalContent.getDisplayName()));
        }
    }

    private isAnyItemDuplicated(duplicatedItems: ContentSummaryAndCompareStatus[]): boolean {
        return duplicatedItems.some((duplicatedItem: ContentSummaryAndCompareStatus) => this.isNewVariant(duplicatedItem));
    }

    private isNewVariant(item: ContentSummaryAndCompareStatus): boolean {
        if (!this.originalContent) {
            return false;
        }

        return item.getContentSummary()?.getVariantOf() === this.originalContent.getId();
    }

    private handleContentDeleted(items: ContentServerChangeItem[]): void {
        if (this.isInDOM() && this.isAnyVariantDeleted(items)) {
            this.loadDataAndUpdateWidgetContent();
        }
    }

    private isAnyVariantDeleted(deletedItems: ContentServerChangeItem[]): boolean {
        return deletedItems.some((deletedItem: ContentServerChangeItem) => this.isVariant(deletedItem.getContentId().toString()));
    }

    private isVariant(id: string): boolean {
        return this.variants?.some((variant: ContentSummaryAndCompareStatus) => variant.getId() === id);
    }

    setContentId(contentId: string): void {
        super.setContentId(contentId);

        if (!this.contentId) {
            this.handleNoSelectedItem();
            return;
        }

        this.loadDataAndUpdateWidgetContent();
    }

    cleanUp(): void {
        super.cleanUp();
        ContentServerEventsHandler.getInstance().unContentDuplicated(this.contentDuplicatedListener);
        ContentServerEventsHandler.getInstance().unContentDeleted(this.contentDeletedListener);
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
        const button: Button = new Button(i18n('widget.variants.create.text'));
        button.addClass('variants-widget-button-create');

        button.onClicked(() => {
            CreateVariantDialog.get().setContent(this.originalContent).setVariants(this.variants).open();
        });

        return button;
    }

    private handleErrorWhileLoadingVariants(): void {
        //
    }

    private isInDOM(): boolean {
        return this.getHTMLElement().isConnected;
    }
}
