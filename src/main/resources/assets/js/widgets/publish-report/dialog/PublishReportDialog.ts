import {ModalDialog} from '@enonic/lib-admin-ui/ui/dialog/ModalDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import * as Q from 'q';
import {FormView} from '@enonic/lib-admin-ui/form/FormView';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {GetContentVersionsRequest} from 'lib-contentstudio/app/resource/GetContentVersionsRequest';
import {ContentVersions} from 'lib-contentstudio/app/ContentVersions';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {ComparisonsContainer} from './ComparisonsContainer';
import {FormItem, FormItemBuilder} from '@enonic/lib-admin-ui/ui/form/FormItem';
import {Form} from '@enonic/lib-admin-ui/ui/form/Form';
import {Fieldset} from '@enonic/lib-admin-ui/ui/form/Fieldset';
import {ValidationResult} from '@enonic/lib-admin-ui/ui/form/ValidationResult';
import {DateRangeInput} from './DateRangeInput';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {Body} from '@enonic/lib-admin-ui/dom/Body';

export class PublishReportDialog
    extends ModalDialog {

    private static INSTANCE: PublishReportDialog;

    private contentId: ContentId;

    private publishedVersions: ContentVersion[];

    private comparisonsContainer: ComparisonsContainer;

    private formItems: FormItem[];

    private form: Form;

    private dateRangeInput: DateRangeInput;

    private dateRangeFormItem: FormItem;

    private constructor() {
        super({
            class: 'publish-report-dialog',
            title: i18n('widget.publish.report.dialog.title'),
        });
    }

    static get(): PublishReportDialog {
        if (!PublishReportDialog.INSTANCE) {
            PublishReportDialog.INSTANCE = new PublishReportDialog();
        }

        return PublishReportDialog.INSTANCE;
    }

    setContentId(value: string): PublishReportDialog {
        this.contentId = new ContentId(value);
        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildToContentPanel(this.form);
            this.appendChildToContentPanel(this.comparisonsContainer);
            this.addAction(new Action(i18n('widget.publish.report.dialog.button.print')).onExecuted(() => window.print()));

            this.comparisonsContainer.getEl().setTabIndex(0); // preventing date popups from opening on click on dialog

            return rendered;
        });
    }

    open(): void {
        this.comparisonsContainer.removeChildren();
        this.dateRangeInput.reset();
        this.dateRangeFormItem.validate(new ValidationResult(), true);

        super.open();

        this.fetchAllPublishedVersions().catch(DefaultErrorHandler.handle);

        Body.get().addClass('publish-report-dialog-open');
    }

    close() {
        Body.get().removeClass('publish-report-dialog-open');

        super.close();
    }

    show() {
        super.show();

        this.whenRendered(() => {
            this.dateRangeInput.hideFromPopup();
        });
    }

    protected initElements(): void {
        super.initElements();

        this.comparisonsContainer = new ComparisonsContainer();
        this.setup();
    }

    protected initListeners(): void {
        super.initListeners();

        this.dateRangeInput.onValueChanged(() => {
            const validationResult: ValidationResult = new ValidationResult();
            this.dateRangeFormItem.validate(validationResult, true);

            if (validationResult.isValid()) {
                this.comparisonsContainer.removeChildren();
                this.filterVersionsByDateRange();
            }
        });
    }

    private setup(): void {
        this.formItems = this.createFormItems();

        this.createForm();
    }

    private createFormItems(): FormItem[] {
        return [this.createDateRangeFormItem()];
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

    private fetchAllPublishedVersions(): Q.Promise<void> {
        this.comparisonsContainer.setContentId(this.contentId);
        this.loadMask.show();

        return new GetContentVersionsRequest(this.contentId).sendAndParse().then((versions: ContentVersions) => {
            this.publishedVersions = versions.get().filter((contentVersion: ContentVersion) => {
                const publishInfo = contentVersion.getPublishInfo();

                return publishInfo?.isPublished() && !publishInfo.isScheduled();
            });

            this.setInitialDateRangeValues();
        }).finally(() => {
            this.loadMask.hide();
        });
    }

    private setInitialDateRangeValues(): void {
        let earliestPublishDate: Date = null;

        this.publishedVersions.forEach((contentVersion: ContentVersion) => {
            const versionPublishDate: Date = contentVersion.getPublishInfo().getTimestamp();

            if (earliestPublishDate) {
                earliestPublishDate =
                    earliestPublishDate.getTime() < versionPublishDate.getTime() ? earliestPublishDate : versionPublishDate;
            } else {
                earliestPublishDate = versionPublishDate;
            }
        });

        if (earliestPublishDate) {
            this.dateRangeInput.setFromTo(earliestPublishDate, new Date());
        }
    }

    private getFrom(): Date {
        return this.dateRangeInput.getFrom();
    }

    private getTo(): Date {
        return this.dateRangeInput.getTo();
    }

    private filterVersionsByDateRange(): void {
        const fromTime = this.getFrom()?.getTime();
        const toTime = this.getTo()?.getTime();

        const filteredVersions: ContentVersion[] = this.publishedVersions.filter((contentVersion: ContentVersion) => {
            const versionPublishTime = contentVersion.getPublishInfo().getTimestamp()?.getTime();
            return versionPublishTime &&
                   (fromTime ? versionPublishTime >= fromTime : true) &&
                   (toTime ? versionPublishTime <= toTime : true);
        });

        this.comparisonsContainer.setVersions(filteredVersions);
    }

}
