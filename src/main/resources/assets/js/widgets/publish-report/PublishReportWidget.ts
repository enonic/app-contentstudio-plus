import {Widget} from '../Widget';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {PublishReportDialog} from './dialog/PublishReportDialog';
import {DateRangeInput} from './dialog/DateRangeInput';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {ValidationResult} from '@enonic/lib-admin-ui/ui/form/ValidationResult';
import * as Q from 'q';

export class PublishReportWidget
    extends Widget {

    private static INSTANCE: PublishReportWidget;

    private generateButton: Button;

    private formItems: FormItem[];

    private form: Form;

    private dateRangeInput: DateRangeInput;

    private dateRangeFormItem: FormItem;

    private isContentArchived: boolean;

    constructor() {
        super(AppHelper.getPublishReportWidgetClass());
    }

    static get(): PublishReportWidget {
        if (!PublishReportWidget.INSTANCE) {
            PublishReportWidget.INSTANCE = new PublishReportWidget();
        }

        return PublishReportWidget.INSTANCE;
    }

    setPublishFirstDateString(value: string): this {
        const publishFirst = new Date(value);
        this.dateRangeInput.setFromTo(publishFirst, new Date());
        this.dateRangeInput.setFirstPublishDate(publishFirst);

        return this;
    }

    setIsContentArchived(value: boolean): this {
        this.isContentArchived = value;

        return this;
    }

    protected initElements(): void {
        super.initElements();

        this.createFormItems();
        this.createForm();
        this.initDialogButton();
    }

    private createFormItems(): void {
        this.formItems = [this.createDateRangeFormItem()];
    }

    private createDateRangeFormItem(): FormItem {
        this.dateRangeInput = new DateRangeInput();

        this.dateRangeFormItem = new FormItemBuilder(this.dateRangeInput)
            .setValidator((input: DateRangeInput) => input.validate())
            .build();

        return this.dateRangeFormItem;
    }

    private createForm(): void {
        this.form = new Form(FormView.VALIDATION_CLASS);

        const fieldSet: Fieldset = new Fieldset();

        this.formItems.forEach((formItem: FormItem) => {
            fieldSet.add(formItem);
        });

        this.form.add(fieldSet);
    }

    private initDialogButton(): void {
        const button: Button = new Button(i18n('widget.publishReport.button.text'));

        button.addClass('widget-publish-report-button-open');

        button.onClicked(() => {
            PublishReportDialog.get()
                .setContentId(this.contentId)
                .setFromTo(this.dateRangeInput.getFrom(), this.dateRangeInput.getTo())
                .setIsContentArchived(this.isContentArchived)
                .open();
        });

        this.generateButton = button;
    }

    protected initListeners() {
        super.initListeners();

        this.dateRangeInput.onValueChanged(() => {
            const validationResult: ValidationResult = new ValidationResult();
            this.dateRangeFormItem.validate(validationResult, true);
            this.generateButton.setEnabled(validationResult.isValid());
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.form.addClass('date-range-form');
            this.appendChildren(this.form, this.generateButton as Element);

            return rendered;
        });
    }
}
