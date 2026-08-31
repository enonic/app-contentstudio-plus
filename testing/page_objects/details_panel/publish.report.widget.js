/**
 * Created on 03.11.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const selectors = {
    widget: `div[data-component="PublishReportWidget"]`,
    // 'Generate' button is a direct child of the widget container:
    generateButton: `div[data-component="PublishReportWidget"] > button[data-component="Button"]`,
    // 'From' and 'To' inputs, in this order:
    dateInput: `input[id*="pr-date-input"]`,
    datePickerTrigger: `button[data-component="DatePicker.Trigger"]`,
    // Calendar of the expanded date picker:
    datePickerGrid: `div[role="grid"]`,
    // Both the date-range validation message and the invalid-format message of a single input:
    validationMessage: `div[data-component="PublishReportWidget"] [class*="text-error"]`,
    // Message that is displayed instead of the date range, when the content has never been published:
    neverPublishedMessage: `div[data-component="PublishReportWidget"] div[class*="text-subtle"]`,
};

class PublishReportWidget extends Page {

    // Returns the widget container inside the shadow root of the context panel extension
    async getWidgetElement() {
        const host = await this.getShadowHost();
        return await host.shadow$(selectors.widget);
    }

    async getDateInputs() {
        const host = await this.getShadowHost();
        return await host.shadow$$(selectors.dateInput);
    }

    async getGenerateButtonElement() {
        const host = await this.getShadowHost();
        return await host.shadow$(selectors.generateButton);
    }

    async waitForWidgetLoaded() {
        try {
            const widget = await this.getWidgetElement();
            await widget.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('Publish report Widget was not loaded', 'err_publish_report_load', err);
        }
    }

    async waitForValidationMessageDisplayed() {
        const host = await this.getShadowHost();
        const viewer = await host.shadow$(selectors.validationMessage);
        return await viewer.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async waitForValidationMessageNotDisplayed() {
        const host = await this.getShadowHost();
        const viewer = await host.shadow$(selectors.validationMessage);
        return await viewer.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    async getValidationMessage() {
        const host = await this.getShadowHost();
        const viewer = await host.shadow$(selectors.validationMessage);
        await viewer.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await viewer.getText();
    }

    // Returns the text of all validation messages: the date-range message and the messages of both date inputs
    async getValidationMessages() {
        const host = await this.getShadowHost();
        const viewers = await host.shadow$$(selectors.validationMessage);
        const result = [];
        for (const viewer of viewers) {
            result.push(await viewer.getText());
        }
        return result;
    }

    // 'Content has never been published' message, it is displayed instead of the date range and 'Generate' button
    async getNeverPublishedMessage() {
        const host = await this.getShadowHost();
        const message = await host.shadow$(selectors.neverPublishedMessage);
        await message.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await message.getText();
    }

    async waitForGenerateButtonDisplayed() {
        try {
            const button = await this.getGenerateButtonElement();
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be displayed`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonNotDisplayed() {
        try {
            const button = await this.getGenerateButtonElement();
            await button.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should not be displayed`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonEnabled() {
        try {
            await this.waitForGenerateButtonDisabledState(false);
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be enabled`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonDisabled() {
        try {
            await this.waitForGenerateButtonDisabledState(true);
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be disabled`, 'err_generate_btn', err);
        }
    }

    // The button is disabled with the 'aria-disabled' attribute, so 'isEnabled()' can not be used here
    async waitForGenerateButtonDisabledState(isDisabled) {
        const button = await this.getGenerateButtonElement();
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await this.getBrowser().waitUntil(async () => {
            const attr = await button.getAttribute('aria-disabled');
            return isDisabled ? attr === 'true' : attr !== 'true';
        }, {
            timeout: appConst.mediumTimeout,
            timeoutMsg: `'Generate' button, expected aria-disabled: ${isDisabled}`
        });
    }

    async isGenerateButtonDisabled() {
        const button = await this.getGenerateButtonElement();
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await button.getAttribute('aria-disabled') === 'true';
    }

    async clickOnGenerateButton() {
        try {
            const button = await this.getGenerateButtonElement();
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            await this.waitForGenerateButtonDisabledState(false);
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on 'Generate'  button`, 'err_click_generate_btn', err);
        }
    }

    async getDateInFromInput() {
        await this.waitForFromDateInputDisplayed();
        const inputs = await this.getDateInputs();
        return await inputs[0].getValue();
    }

    async getDateInToInput() {
        await this.waitForToDateInputDisplayed();
        const inputs = await this.getDateInputs();
        return await inputs[1].getValue();
    }

    async waitForFromDateInputDisplayed() {
        try {
            const inputs = await this.getDateInputs();
            await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`PublishReport : From date text input should be displayed`, 'err_publish_rep_from_date', err);
        }
    }

    async waitForFromDateInputNotDisplayed() {
        try {
            const inputs = await this.getDateInputs();
            if (inputs.length === 0) {
                return;
            }
            await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
        } catch (err) {
            await this.handleError(`PublishReport : From date text input should not be displayed`, 'err_publish_rep_from_date', err);
        }
    }

    async waitForToDateInputDisplayed() {
        try {
            const inputs = await this.getDateInputs();
            await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('PublishReport widget: To date text input should be displayed', 'err_to_date_in_publish_report', err);
        }
    }

    async waitForToDateInputNotDisplayed() {
        try {
            const inputs = await this.getDateInputs();
            if (inputs.length < 2) {
                return;
            }
            await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
        } catch (err) {
            await this.handleError('PublishReport widget: To date text input should not be displayed', 'err_to_date_in_publish_report', err);
        }
    }

    // the date should be in YYYY-MM-DD format
    async typeInFromDateInput(date) {
        try {
            const inputs = await this.getDateInputs();
            await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            await inputs[0].setValue(date);
        } catch (err) {
            await this.handleError('PublishReport - tried to insert a date in from input', 'err_from_date_in_publish_report_dlg', err);
        }
    }

    // the date should be in YYYY-MM-DD format
    async typeInToInput(dateTime) {
        try {
            const inputs = await this.getDateInputs();
            await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout});
            await inputs[1].setValue(dateTime);
        } catch (err) {
            await this.handleError('PublishReport -  tried to insert a date in to input', 'err_load_publish_report_dlg', err);
        }
    }

    async clearFromDateInput() {
        const inputs = await this.getDateInputs();
        await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await inputs[0].clearValue();
    }

    async clearToDateInput() {
        const inputs = await this.getDateInputs();
        await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await inputs[1].clearValue();
    }

    // Clicks on the calendar-icon button in 'From'(index 0) or in 'To'(index 1) input
    async clickOnDatePickerTrigger(index) {
        try {
            const host = await this.getShadowHost();
            const triggers = await host.shadow$$(selectors.datePickerTrigger);
            await triggers[index].waitForDisplayed({timeout: appConst.mediumTimeout});
            await triggers[index].click();
            return await this.waitForDatePickerCalendarDisplayed();
        } catch (err) {
            await this.handleError('PublishReport - tried to expand the date picker', 'err_publish_report_date_picker', err);
        }
    }

    async waitForDatePickerCalendarDisplayed() {
        const host = await this.getShadowHost();
        const grid = await host.shadow$(selectors.datePickerGrid);
        return await grid.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async waitForDatePickerCalendarNotDisplayed() {
        const host = await this.getShadowHost();
        const grid = await host.shadow$(selectors.datePickerGrid);
        return await grid.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }
}

module.exports = PublishReportWidget;
