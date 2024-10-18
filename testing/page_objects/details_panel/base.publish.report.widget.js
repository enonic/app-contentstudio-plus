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
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_load');
            throw new Error('Publish report Widget was not loaded, screenshot' + screenshot + ' ' + err);
        }
    }

    async waitForGenerateButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_generate_btn');
            throw new Error("Publish report widget - 'Generate' button should not be displayed, screenshot: " + screenshot + ' ' + err);
        }
    }

    async waitForGenerateButtonEnabled() {
        try {
            await this.waitForElementDisplayed(this.generateButton, appConst.mediumTimeout);
            return await this.waitForElementEnabled(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_generate_btn_widget');
            throw new Error("Publish report widget - Error 'Generate' button should be enabled, screenshot: " + screenshot + ' ' + err);
        }
    }

    async waitForGenerateButtonDisabled() {
        try {
            await this.waitForElementDisplayed(this.generateButton, appConst.mediumTimeout);
            return await this.waitForElementDisabled(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_generate_btn_widget');
            throw new Error(`Publish report widget - Error 'Generate' button should be disabled, screenshot: ${screenshot} ` + err);
        }
    }

    async clickOnGenerateButton() {
        try {
            await this.waitForGenerateButtonEnabled();
            return await this.clickOnElement(this.generateButton);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_click_on_generate');
            throw new Error(`Error after clicking on Generate button, screenshot:${screenshot} ` + err);
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
            let screenshot = await this.saveScreenshotUniqueName('err_publish_rep_from_date');
            throw new Error(`PublishReport  From date text input should be displayed, screenshot: ${screenshot} ` + err);
        }
    }

    async waitForFromDateInputNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.fromDateInput, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_rep_from_date');
            throw new Error(`PublishReport  From date text input should not be displayed, screenshot: ${screenshot} ` + err);
        }
    }

    async waitForToDateInputDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.toDateInput, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_rep_to_date');
            throw new Error("PublishReport widget, To date text input should be displayed, screenshot:  " + screenshot + ' ' + err);
        }
    }

    async waitForToDateInputNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.toDateInput, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_rep_to_date');
            throw new Error("PublishReport widget, To date text input should not be displayed, screenshot:  " + screenshot + ' ' + err);
        }
    }

    async typeInFromDateInput(date) {
        try {
            await this.waitForFromDateInputDisplayed();
            return await this.typeTextInInput(this.fromDateInput, date);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_load_publish_report_dlg');
            throw new Error("PublishReport  error during inserting a date in from input, screenshot:  " + screenshot + ' ' + err);
        }
    }

    async typeInToInput(dateTime) {
        try {
            await this.waitForFromDateInputDisplayed();
            return await this.typeTextInInput(this.toDateInput, dateTime);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_to_datetime');
            throw new Error("PublishReport error during inserting a date in 'to' input, screenshot:  " + screenshot + ' ' + err);
        }
    }
}

module.exports = BasePublishReportWidget;
