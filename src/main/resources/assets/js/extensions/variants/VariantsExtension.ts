import {Extension} from '../Extension';
import {AppHelper} from '../../util/AppHelper';
import Q from 'q';
import {GetContentVariantsRequest} from './resource/request/GetContentVariantsRequest';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {CreateVariantDialog} from './dialog/CreateVariantDialog';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {VariantsList} from './ui/list/VariantsList';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {NotifyManager} from '@enonic/lib-admin-ui/notify/NotifyManager';
import {ContentServerChangeItem} from '@enonic/lib-contentstudio/app/event/ContentServerChangeItem';

export class VariantsExtension
    extends Extension {

    private createVariantsButton?: Button;

    private originalContent: ContentSummaryAndCompareStatus;

    private variants: ContentSummaryAndCompareStatus[];

    private variantsList: VariantsList;

    private contentDuplicatedListener: (items: ContentSummaryAndCompareStatus[]) => void;

    private contentDeletedListener: (items: ContentServerChangeItem[]) => void;

    constructor(contentId: string) {
        super(contentId, AppHelper.getVariantsExtensionClass());
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
            this.fetchAndProcessContent();
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
            this.fetchAndProcessContent();
        }
    }

    private isAnyVariantDeleted(deletedItems: ContentServerChangeItem[]): boolean {
        return deletedItems.some((deletedItem: ContentServerChangeItem) => this.isVariant(deletedItem.getContentId().toString()));
    }

    private isVariant(id: string): boolean {
        return this.variants?.some((variant: ContentSummaryAndCompareStatus) => variant.getId() === id);
    }

    cleanUp(): void {
        super.cleanUp();
        ContentServerEventsHandler.getInstance().unContentDuplicated(this.contentDuplicatedListener);
        ContentServerEventsHandler.getInstance().unContentDeleted(this.contentDeletedListener);
    }

    protected renderExtensionContents(): void {
        this.fetchAndProcessContent();
    }

    protected processContent(content: ContentSummaryAndCompareStatus): Q.Promise<void> {
        return this.findOriginalContent(content)
            .then(() => this.fetchAndDisplayVariants());
    }

    private findOriginalContent(content: ContentSummaryAndCompareStatus): Q.Promise<void> {
        if (content.isVariant()) {
            const variantId: string = content.getContentSummary().getVariantOf();
            return this.fetchAndProcessContent(variantId, (original: ContentSummaryAndCompareStatus) => {
                this.originalContent = original;
                return;
            })
        }

        this.originalContent = content;
        return Q.resolve();
    }

    private fetchAndDisplayVariants(): Q.Promise<void> {
        return new GetContentVariantsRequest(this.originalContent.getId())
            .fetchWithCompareStatus()
            .then((variants: ContentSummaryAndCompareStatus[]) => {
                this.variants = variants;
                this.displayVariants();
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
        button.addClass('variants-extension-button-create');

        button.onClicked(() => {
            CreateVariantDialog.get(this).setContent(this.originalContent).setVariants(this.variants).open();
        });

        return button;
    }

    private isInDOM(): boolean {
        return this.getHTMLElement().isConnected;
    }
}
