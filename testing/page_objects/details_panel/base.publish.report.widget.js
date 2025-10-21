/**
 * Created on 03.11.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

class BasePublishReportWidget extends Page {

    get generateButton() {
        return this.publishReportWidget + lib.BUTTONS.PUBLISH_REPORT_GENERATE;
    }

    get fromDateInput() {
        return this.publishReportWidget + lib.DATE_PICKER.fromDateInput;
    }

    get toDateInput() {
        return this.publishReportWidget + lib.DATE_PICKER.toDateInput;
    }

    get reportValidationViewer() {
        return this.publishReportWidget + lib.VALIDATION_RECORDING_VIEWER;
    }

    isWidgetVisible() {
        return this.isElementDisplayed(this.publishReportWidget);
    }

    waitForValidationMessageDisplayed() {
        return this.waitForElementDisplayed(this.reportValidationViewer, appConst.mediumTimeout);
    }

    waitForValidationMessageNotDisplayed() {
        return this.waitForElementNotDisplayed(this.reportValidationViewer, appConst.mediumTimeout);
    }

    async getValidationMessage() {
        await this.waitForValidationMessageDisplayed();
        return await this.getText(this.reportValidationViewer);
    }

    async waitForWidgetLoaded() {
        try {
            let locator = "//div[contains(@id,'WidgetsSelectionRow')]" + lib.itemByName('Compare published versions');
            return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Publish report Widget was not loaded', 'err_publish_report_load', err);
        }
    }

    async waitForGenerateButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should not be displayed`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonEnabled() {
        try {
            await this.waitForElementDisplayed(this.generateButton, appConst.mediumTimeout);
            return await this.waitForElementEnabled(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be enabled`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonDisabled() {
        try {
            await this.waitForElementDisplayed(this.generateButton, appConst.mediumTimeout);
            return await this.waitForElementDisabled(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be disabled`, 'err_generate_btn', err);
        }
    }

    async clickOnGenerateButton() {
        try {
            await this.waitForGenerateButtonEnabled();
            return await this.clickOnElement(this.generateButton);
        } catch (err) {
            await this.handleError(`Tried to click on 'Generate'  button`, 'err_click_generate_btn', err);
        }
    }

    async getDateInFromInput() {
        await this.waitForFromDateInputDisplayed();
        return await this.getTextInInput(this.fromDateInput);
    }

    async getDateInToInput() {
        await this.waitForToDateInputDisplayed();
        return await this.getTextInInput(this.toDateInput);
    }

    async waitForFromDateInputDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.fromDateInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`PublishReport : From date text input should be displayed`, 'err_publish_rep_from_date', err);
        }
    }

    async waitForFromDateInputNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.fromDateInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`PublishReport : From date text input should not be displayed`, 'err_publish_rep_from_date', err);
        }
    }

    async waitForToDateInputDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.toDateInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('PublishReport widget: To date text input should be displayed', 'err_publish_rep_to_date', err);
        }
    }

    async waitForToDateInputNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.toDateInput, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('PublishReport widget: To date text input should not be displayed', 'err_publish_rep_to_date', err);
        }
    }

    async typeInFromDateInput(date) {
        try {
            await this.waitForFromDateInputDisplayed();
            return await this.typeTextInInput(this.fromDateInput, date);
        } catch (err) {
            await this.handleError('PublishReport - tried to insert a date in from input', 'err_load_publish_report_dlg', err);
        }
    }

    async typeInToInput(dateTime) {
        try {
            await this.waitForFromDateInputDisplayed();
            return await this.typeTextInInput(this.toDateInput, dateTime);
        } catch (err) {
            await this.handleError('PublishReport -  tried to insert a date in to input', 'err_load_publish_report_dlg', err);
        }
    }
}

module.exports = BasePublishReportWidget;
