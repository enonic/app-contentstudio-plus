/**
 * Created on 09.07.2020.
 */

const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LoaderComboBox = require('../components/loader.combobox');

class BaseSelectorForm extends Page {

    get selectorValidationRecording() {
        return lib.FORM_VIEW + lib.INPUT_VALIDATION_VIEW;
    }

    async getSelectorValidationMessage() {
        let locator = lib.CONTENT_WIZARD_STEP_FORM + this.selectorValidationRecording;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator);
    }

    async waitForSelectorValidationMessageNotDisplayed() {
        await this.getBrowser().waitUntil(async () => {
            let elements = await this.getDisplayedElements(this.selectorValidationRecording);
            return elements.length === 0;
        }, {timeout: appConst.mediumTimeout, timeoutMsg: "Selector Validation recording should not be displayed"});
    }
    //Selects an option by the display name
    async selectOption(optionDisplayName) {
        let loaderComboBox = new LoaderComboBox();
        await this.typeTextInInput(this.optionsFilterInput, optionDisplayName);
        await loaderComboBox.selectOption(optionDisplayName);
        return await loaderComboBox.pause(300);
    }

    async typeTextInOptionsFilterInput(text) {
        await this.typeTextInInput(this.optionsFilterInput, text);
        return await this.pause(500);
    }

    //Selects an option by the name
    async selectOptionByName(optionName) {
        let loaderComboBox = new LoaderComboBox();
        await this.typeTextInInput(this.optionsFilterInput, optionName);
        await loaderComboBox.selectOptionByName(optionName);
        return await loaderComboBox.pause(300);
    }

    async swapOptions(sourceName, destinationName) {
        let sourceElem = this.selectedOptionByDisplayName(sourceName);
        let destinationElem = this.selectedOptionByDisplayName(destinationName);
        let source = await this.findElement(sourceElem);
        let destination = await this.findElement(destinationElem);
        await source.dragAndDrop(destination);
        return await this.pause(1000);
    }

    isOptionFilterDisplayed() {
        return this.isElementDisplayed(this.optionsFilterInput);
    }

    async waitForEmptyOptionsMessage() {
        try {
            return await this.waitForElementDisplayed(lib.EMPTY_OPTIONS_DIV, appConst.longTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_empty_opt"));
            throw new Error("Empty options text is not visible " + err);
        }
    }
}

module.exports = BaseSelectorForm;
