import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {OriginalContentBlock} from './OriginalContentBlock';
import * as Q from 'q';
import {VariantNameFormItem} from './VariantNameFormItem';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {ValidityChangedEvent} from '@enonic/lib-admin-ui/ValidityChangedEvent';
import {VariableNameHelper} from './VariableNameHelper';

export class CreateVariantDialog
    extends ModalDialog {

    private static INSTANCE: CreateVariantDialog;

    private originalContentBlock: OriginalContentBlock;

    private variantNameFormItem: VariantNameFormItem;

    private createAction: Action;

    private variants: ContentSummary[] = [];

    private constructor() {
        super({
            class: 'create-variant-dialog',
            title: i18n('widget.variants.dialog.create.title'),
        });
    }

    static get(): CreateVariantDialog {
        if (!CreateVariantDialog.INSTANCE) {
            CreateVariantDialog.INSTANCE = new CreateVariantDialog();
        }

        return CreateVariantDialog.INSTANCE;
    }

    protected initElements(): void {
        super.initElements();

        this.originalContentBlock = new OriginalContentBlock();
        this.variantNameFormItem = new VariantNameFormItem();
        this.createAction = new Action(i18n('widget.variants.dialog.create.submit'));
    }

    protected postInitElements(): void {
        super.postInitElements();

        this.variantNameFormItem.setIsNameOccupiedHandler(this.isNameOccupied.bind(this));
    }

    protected initListeners(): void {
        super.initListeners();

        this.createAction.onExecuted(() => {
           this.createVariant();
        });

        this.variantNameFormItem.onValidityChanged((event: ValidityChangedEvent) => {
            this.createAction.setEnabled(event.isValid());
        });
    }

    private createVariant(): void {
        //
    }

    setContent(content: ContentSummaryAndCompareStatus): CreateVariantDialog {
        this.originalContentBlock.setContent(content);
        return this;
    }

    setVariants(variants: ContentSummary[]): CreateVariantDialog {
        this.variants = variants || [];
        return this;
    }

    private isNameOccupied(name: string): boolean {
        return this.variants.some((variant: ContentSummary) => {
            return variant.getPath().getName() === name;
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildToContentPanel(this.originalContentBlock);
            this.appendChildToContentPanel(this.createFormContainerForNameInput());
            this.addAction(this.createAction);
            return rendered;
        });
    }


    private createFormContainerForNameInput(): Form {
        const form: Form = new Form(FormView.VALIDATION_CLASS);
        const fieldSet: Fieldset = new Fieldset();
        fieldSet.add(this.variantNameFormItem);
        form.add(fieldSet);
        return form;
    }

    open(): void {
        this.variantNameFormItem.setValue(new VariableNameHelper(this.variants).getNextAvailableName());
        super.open();
    }
}
