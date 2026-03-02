import {Extension} from '../Extension';
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

export class PublishReportExtension
    extends Extension {

    private generateButton: Button;

    private formItems: FormItem[];

    private form: Form;

    private dateRangeInput: DateRangeInput;

    private dateRangeFormItem: FormItem;

    private isContentArchived: boolean;

    constructor(contentId: string, firstPublished: string, isArchived: boolean) {
        super(contentId, AppHelper.getPublishReportExtensionClass());

        this.isContentArchived = isArchived;
        this.setPublishFirstDateString(firstPublished);
    }

    protected renderExtensionContents(): void {
        this.appendChildren(this.form, this.generateButton as Element);
    }

    setPublishFirstDateString(value: string) {
        const publishFirst = new Date(value);
        this.dateRangeInput.setFromTo(publishFirst, new Date());
        this.dateRangeInput.setFirstPublishDate(publishFirst);
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
        this.form.addClass('date-range-form');

        const fieldSet: Fieldset = new Fieldset();

        this.formItems.forEach((formItem: FormItem) => {
            fieldSet.add(formItem);
        });

        this.form.add(fieldSet);
    }

    private initDialogButton(): void {
        const button: Button = new Button(i18n('widget.publishReport.button.text'));

        button.addClass('extension-publish-report-button-open');

        button.onClicked(() => {
            PublishReportDialog.get(this)
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
}
