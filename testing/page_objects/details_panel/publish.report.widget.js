/**
 * Created on 03.11.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const selectors = {
    shadowHost: "context-panel-extension",
    generateButton: 'button[class*="extension-publish-report-button"]',
    datePickerInput: 'div[id*="DatePicker"] input[id*="TextInput"]',
    validationViewer: 'div[id*="ValidationRecordingViewer"] li',


};
class PublishReportWidget extends Page {

    get generateButton() {
        return lib.BUTTONS.PUBLISH_REPORT_GENERATE;
    }

    get fromDateInput() {
        return lib.DATE_PICKER.fromDateInput;
    }

    get toDateInput() {
        return  lib.DATE_PICKER.toDateInput;
    }

    get reportValidationViewer() {
        return  lib.VALIDATION_RECORDING_VIEWER;
    }

    async waitForValidationMessageDisplayed() {
        const host = await this.getShadowHost();
        const viewer = await host.shadow$(selectors.validationViewer);
        return await viewer.waitForDisplayed({timeout: appConst.mediumTimeout});
    }


    async waitForValidationMessageNotDisplayed() {
        const host = await this.getShadowHost();
        const viewer = await host.shadow$(selectors.validationViewer);
        return await viewer.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    async getValidationMessage() {
        const host = await this.getShadowHost();
        const viewer = await host.shadow$(selectors.validationViewer);
        await viewer.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await viewer.getText();
    }


    async waitForWidgetLoaded() {
        try {
            const host = await this.getShadowHost();
            let locator = "//div[contains(@id,'ExtensionSelectionRow')]" + lib.itemByName('Compare published versions');
            return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Publish report Widget was not loaded', 'err_publish_report_load', err);
        }
    }

    async waitForGenerateButtonNotDisplayed() {
        try {
            let host = await this.getShadowHost();
            const button = await host.shadow$(selectors.generateButton);
            return await this.waitForElementNotDisplayed(this.generateButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should not be displayed`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonEnabled() {
        try {
            let host = await this.getShadowHost();
            const button = await host.shadow$(selectors.generateButton);
            await button.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be enabled`, 'err_generate_btn', err);
        }
    }

    async waitForGenerateButtonDisabled() {
        try {
            const host = await this.getShadowHost();
            const button = await host.shadow$(selectors.generateButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            await button.waitForEnabled({timeout: appConst.mediumTimeout, reverse: true});
        } catch (err) {
            await this.handleError(`Publish report widget - 'Generate' button should be disabled`, 'err_generate_btn', err);
        }
    }

    async clickOnGenerateButton() {
        try {
            let host = await this.getShadowHost();
            const button = await host.shadow$(selectors.generateButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            await button.waitForEnabled({timeout: appConst.mediumTimeout});
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on 'Generate'  button`, 'err_click_generate_btn', err);
        }
    }

    async getDateInFromInput() {
        await this.waitForFromDateInputDisplayed();
        const host = await this.getShadowHost();
        const inputs = await host.shadow$$(selectors.datePickerInput);
        await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await inputs[0].getValue();

    }

    async getDateInToInput() {
        const host = await this.getShadowHost();
        const inputs = await host.shadow$$(selectors.datePickerInput);
        await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await inputs[1].getValue();

    }

    async waitForFromDateInputDisplayed() {
        try {
            const host = await this.getShadowHost();
            const inputs = await host.shadow$$(selectors.datePickerInput);
            await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`PublishReport : From date text input should be displayed`, 'err_publish_rep_from_date', err);
        }
    }

    async waitForFromDateInputNotDisplayed() {
        try {
            const host = await this.getShadowHost();
            const inputs = await host.shadow$$(selectors.datePickerInput);
            if (inputs.length === 0) return;
            await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
        } catch (err) {
            await this.handleError(`PublishReport : From date text input should not be displayed`, 'err_publish_rep_from_date', err);
        }
    }



    async waitForToDateInputDisplayed() {
        try {
            const host = await this.getShadowHost();
            const inputs = await host.shadow$$(selectors.datePickerInput);
            await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('PublishReport widget: To date text input should be displayed', 'err_publish_rep_to_date', err);
        }
    }

    async waitForToDateInputNotDisplayed() {
        try {
            const host = await this.getShadowHost();
            const inputs = await host.shadow$$(selectors.datePickerInput);
            if (inputs.length === 0) return;
            await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
        } catch (err) {
            await this.handleError('PublishReport widget: To date text input should not be displayed', 'err_publish_rep_to_date', err);
        }
    }

    async typeInFromDateInput(date) {
        try {
            const host = await this.getShadowHost();
            const inputs = await host.shadow$$(selectors.datePickerInput);
            await inputs[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            await inputs[0].setValue(date);
        } catch (err) {
            await this.handleError('PublishReport - tried to insert a date in from input', 'err_load_publish_report_dlg', err);
        }
    }

    async typeInToInput(dateTime) {
        try {
            const host = await this.getShadowHost();
            const inputs = await host.shadow$$(selectors.datePickerInput);
            await inputs[1].waitForDisplayed({timeout: appConst.mediumTimeout});
            await inputs[1].setValue(dateTime);
        } catch (err) {
            await this.handleError('PublishReport -  tried to insert a date in to input', 'err_load_publish_report_dlg', err);
        }
    }

}

module.exports = PublishReportWidget;
