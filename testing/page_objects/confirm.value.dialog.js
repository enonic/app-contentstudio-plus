/**
 * Created  on 20/01/2018
 */
const Page = require('./page');
const {BUTTONS} = require('../libs/elements');

// The dialog is rendered by the shared 'DialogPresetGatedConfirmContent' component, so the same page object
// serves every gated confirmation: 'Confirm delete', 'Confirm restore', 'Confirm archive'...
const XPATH = {
    container: `//div[@data-component='DialogPresetGatedConfirmContent']`,
    containerByTitle: title => `//div[@data-component='DialogPresetGatedConfirmContent' and descendant::h2[contains(.,'${title}')]]`,
    title: `//h2[@data-component='Dialog.Title']`,
    description: `//p[@data-component='Dialog.Description']`,
    // 'Enter 12 in the field and click Confirm:' - the expected value is in the strong element
    expectedValue: `//p/strong`,
    // The input has 'inputmode=numeric' only when a number is expected, so the input is not addressed by that attribute
    valueInput: `//div[@data-component='Input']//input`,
    cancelButton: `//button[@data-component='Dialog.Close' and @aria-label='Cancel']`,
};

class ConfirmValueDialog extends Page {

    // title(optional) - scopes the locators to one confirmation dialog: 'Confirm delete', 'Confirm restore'
    constructor(title) {
        super();
        this.container = title === undefined ? XPATH.container : XPATH.containerByTitle(title);
    }

    get confirmButton() {
        return this.container + BUTTONS.buttonAriaLabel('Confirm');
    }

    get cancelButton() {
        return this.container + XPATH.cancelButton;
    }

    // There is no 'close' icon in this dialog, the 'Cancel' button closes it
    get closeButton() {
        return this.cancelButton;
    }

    get numberInput() {
        return this.container + XPATH.valueInput;
    }

    // Title: 'Confirm delete' or 'Confirm restore'
    async getDialogTitle() {
        let locator = this.container + XPATH.title;
        await this.waitForElementDisplayed(locator);
        return await this.getText(locator);
    }

    // Subtitle: 'Selected items will be moved from the Archive back to the Content grid'
    async getDialogSubtitle() {
        let locator = this.container + XPATH.description;
        await this.waitForElementDisplayed(locator);
        return await this.getText(locator);
    }

    async waitForDialogOpened() {
        try {
            await this.waitForElementDisplayed(this.container);
        } catch (err) {
            await this.handleError('Confirm Value Dialog should be loaded', 'err_confirm_value_dlg_opened', err);
        }
    }

    async waitForDialogClosed() {
        try {
            return await this.waitForElementNotDisplayed(this.container);
        } catch (err) {
            await this.handleError('Confirm Value Dialog should be closed', 'err_confirm_value_dlg_closed', err);
        }
    }

    async waitForConfirmButtonDisabled() {
        try {
            await this.waitForElementDisabled(this.confirmButton);
        } catch (err) {
            await this.handleError('Confirm Value Dialog - Confirm button', 'err_confirm_value_dlg_confirm_button', err);
        }
    }

    async waitForConfirmButtonEnabled() {
        try {
            await this.waitForElementEnabled(this.confirmButton);
        } catch (err) {
            await this.handleError('Confirm Value Dialog - Confirm button', 'err_confirm_value_dlg_confirm_button', err);
        }
    }

    async clickOnCancelButton() {
        await this.waitForElementDisplayed(this.cancelButton);
        await this.clickOnElement(this.cancelButton);
        return await this.pause(500);
    }

    clickOnCloseButton() {
        return this.clickOnCancelButton();
    }

    async clickOnConfirmButton() {
        try {
            await this.waitForElementEnabled(this.confirmButton);
            await this.clickOnElement(this.confirmButton);
            //modal dialog closes:
            await this.waitForElementNotDisplayed(this.container);
            return await this.pause(1000);
        } catch (err) {
            await this.handleError('Confirm Value dialog - Confirm button', 'err_confirm_value_dlg_confirm_button', err);
        }
    }

    async typeNumberOrName(value) {
        return await this.typeTextInInput(this.numberInput, value);
    }

    async getValueInInput() {
        let input = await this.findElement(this.numberInput);
        return await input.getValue();
    }

    // The value that should be typed in the input to enable the 'Confirm' button
    getSuggestedValue() {
        const locator = this.container + XPATH.expectedValue;
        return this.getText(locator);
    }

    getSuggestedNumberToDelete() {
        return this.getSuggestedValue();
    }
}

module.exports = ConfirmValueDialog;
