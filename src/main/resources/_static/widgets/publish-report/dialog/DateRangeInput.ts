import {FormInputEl} from '@enonic/lib-admin-ui/dom/FormInputEl';
import {DatePicker, DatePickerBuilder} from '@enonic/lib-admin-ui/ui/time/DatePicker';
import {SelectedDateChangedEvent} from '@enonic/lib-admin-ui/ui/time/SelectedDateChangedEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {DateHelper} from '@enonic/lib-admin-ui/util/DateHelper';

export class DateRangeInput extends FormInputEl {

    private readonly from: DatePicker;

    private readonly to: DatePicker;

    private fromDate: Date;

    private toDate: Date;

    private firstPublishDate: Date;

    private limitToDate: Date;

    constructor() {
        super('div', 'date-range-input');

        this.from = new DatePickerBuilder().build().addClass('from') as DatePicker;
        this.to = new DatePickerBuilder().build().addClass('to') as DatePicker;
        const labelFrom: LabelEl = new LabelEl(i18n('widget.publishReport.dateRange.label.from'), this.from, 'labelFrom');
        const labelTo: LabelEl = new LabelEl(i18n('widget.publishReport.dateRange.label.to'), this.to, 'labelTo');

        this.limitToDate = new Date(); // "To" value can't be later than current date
        this.limitToDate.setHours(23, 59, 59, 999);

        this.appendChildren(labelFrom, this.from as Element, labelTo, this.to);

        this.initListeners();
    }

    private initListeners(): void {
        this.from.onSelectedDateTimeChanged((event: SelectedDateChangedEvent) => {
            this.updateFromDate(event.getDate());
            this.setValue(this.generateFormInputValue(), false, event.isUserInput());
        });

        this.to.onSelectedDateTimeChanged((event: SelectedDateChangedEvent) => {
            this.updateToDate(event.getDate());
            this.setValue(this.generateFormInputValue(), false, event.isUserInput());
        });
    }

    private updateFromDate(date: Date): void {
        this.fromDate = date;

        if (this.fromDate) {
            this.fromDate.setHours(0, 0, 0, 0);
        }
    }

    private updateToDate(date: Date): void {
        this.toDate = date;

        if (this.toDate) {
            this.toDate.setHours(23, 59, 59, 999); // add one day to include whole selected date
        }
    }

    private generateFormInputValue(): string { // generating value to trigger value change event and validation
        return this.from.getTextInput().getValue() + ' - ' + this.to.getTextInput().getValue();
    }

    setFirstPublishDate(value: Date): this {
        this.firstPublishDate = value ? new Date(value) : value;
        this.firstPublishDate?.setHours(0, 0, 0, 0);
        return this;
    }

    getFrom(): Date {
        return this.fromDate;
    }

    getTo(): Date {
        return this.toDate;
    }

    setFromTo(from: Date, to: Date): void {
        this.updateFromDate(from);
        this.from.setDateTime(this.fromDate, false);
        this.updateToDate(to);
        this.to.setDateTime(this.toDate, false);
        this.setValue(this.generateFormInputValue(), false, true);
    }

    reset(): void {
        this.from.setDateTime(null, false);
        this.fromDate = null;
        this.to.setDateTime(null, false);
        this.toDate = null;
        this.setValue('', true, false);
    }

    validate(): string {
        if (!this.from.isValid() || !this.to.isValid()) {
            return i18n('widget.publishReport.dateRange.invalid.value');
        }

        if (this.fromDate?.getTime() > this.toDate?.getTime()) {
            return i18n('widget.publishReport.dateRange.invalid.range');
        }

        let compoundMessage: string = null;

        if (this.firstPublishDate && this.fromDate?.getTime() < this.firstPublishDate.getTime()) {
            const formattedDate = DateHelper.formatDate(this.firstPublishDate);
            compoundMessage = i18n('widget.publishReport.dateRange.invalid.from', formattedDate);
        }

        if (this.toDate && this.toDate.getTime() > this.limitToDate.getTime()) {
            const msg = i18n('widget.publishReport.dateRange.invalid.to');

            compoundMessage = compoundMessage ? `${compoundMessage} , ${msg}` : msg;

        }

        return compoundMessage;
    }
}
