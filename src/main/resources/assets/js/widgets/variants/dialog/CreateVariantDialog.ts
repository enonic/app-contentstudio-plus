import {Store} from '@enonic/lib-admin-ui/store/Store';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {OriginalContentBlock} from './OriginalContentBlock';
import Q from 'q';
import {VariableNameHelper} from './VariableNameHelper';
import {DuplicateContentRequest} from '@enonic/lib-contentstudio/app/resource/DuplicateContentRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentDuplicateParams} from '@enonic/lib-contentstudio/app/resource/ContentDuplicateParams';
import {VariantNameInput} from './VariantNameInput';
import {ValidityStatus, ValueValidationState} from '@enonic/lib-contentstudio/app/inputtype/text/CheckedValueInput';
import {Widget} from '../../Widget';

export class CreateVariantDialog
    extends ModalDialog {

    private originalContentBlock: OriginalContentBlock;

    private variantNameInput: VariantNameInput;

    private createAction: Action;

    private variants: ContentSummaryAndCompareStatus[] = [];

    private originalContent: ContentSummaryAndCompareStatus;

    private constructor(container: Element) {
        super({
            class: 'create-variant-dialog',
            title: i18n('widget.variants.create.text'),
            container: container
        });
    }

    static get(hostElement: Element): CreateVariantDialog {
        let instance: CreateVariantDialog = Store.instance().get(CreateVariantDialog.name);
        const container = Widget.getContainer(hostElement);

        if (instance == null) {
            instance = new CreateVariantDialog(container);
            Store.instance().set(CreateVariantDialog.name, instance);
        } else {
            instance.setContainer(container);
        }

        return instance;
    }

    protected initElements(): void {
        super.initElements();

        this.originalContentBlock = new OriginalContentBlock();
        this.createAction = new Action(i18n('widget.variants.create.text'));
        this.variantNameInput = new VariantNameInput();
    }

    protected initListeners(): void {
        super.initListeners();

        this.createAction.onExecuted(() => {
            this.createVariant();
        });

        this.variantNameInput.onValueCheckInProgress(() => {
            this.createAction.setEnabled(false);
        });

        this.variantNameInput.onStateUpdated((state: ValueValidationState) => {
            this.createAction.setEnabled(state.getStatus() === ValidityStatus.VALID);
        });
    }

    private createVariant(): void {
        this.sendCreateVariantRequest();
        this.close();
    }

    private sendCreateVariantRequest(): void {
        const item: ContentDuplicateParams = new ContentDuplicateParams(this.originalContent.getContentId())
            .setIncludeChildren(false)
            .setVariant(true)
            .setParent(this.originalContent.getPath().toString())
            .setName(this.variantNameInput.getValue());

        new DuplicateContentRequest([item]).sendAndParse().catch(DefaultErrorHandler.handle);
    }

    setContent(content: ContentSummaryAndCompareStatus): CreateVariantDialog {
        this.originalContent = content;
        this.originalContentBlock.setContent(content);
        return this;
    }

    setVariants(variants: ContentSummaryAndCompareStatus[]): CreateVariantDialog {
        this.variants = variants || [];
        this.variantNameInput.setVariants(this.variants);
        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildToContentPanel(this.originalContentBlock);
            this.appendChildToContentPanel(this.variantNameInput);
            this.addAction(this.createAction);
            return rendered;
        });
    }

    open(): void {
        this.variantNameInput.setValue(new VariableNameHelper(this.variants).getNextAvailableName());
        super.open();
    }

    close(): void {
        super.close();
        this.variantNameInput.reset();
    }
}
