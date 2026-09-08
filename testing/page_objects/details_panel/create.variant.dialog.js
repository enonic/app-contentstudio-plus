/**
 * Created  on 01.04.2023 updated on 31.08.2026
 */
const Page = require('../page');

const DIALOG = `div[data-component="CreateVariantDialog"]`;

const selectors = {
    dialog: DIALOG,
    title: `${DIALOG} h2[data-component="Dialog.Title"]`,
    closeButton: `${DIALOG} button[data-component="Dialog.DefaultClose"]`,
    variantNameInput: `${DIALOG} div[data-component="Input"] input`,
    validationMessage: `${DIALOG} div[data-component="Input"] div[class*="text-error"]`,
    createButton: `${DIALOG} footer[data-component="Dialog.Footer"] button[data-component="Button"]`,
};

class CreateVariantDialog extends Page {

    async typeTextInVariantNameInput(text) {
        await this.clearVariantNameInput();
        const input = await this.findElement(selectors.variantNameInput);
        await input.addValue(text);
        return await this.pause(300);
    }

    async clearVariantNameInput() {
        await this.waitForElementDisplayed(selectors.variantNameInput);
        return await this.clearInputText(selectors.variantNameInput);
    }

    async getTextInVariantNameInput() {
        return await this.getTextInInput(selectors.variantNameInput);
    }

    async waitForCreateVariantButtonEnabled() {
        await this.waitForElementDisplayed(selectors.createButton);
        return await this.waitForElementEnabled(selectors.createButton);
    }

    async waitForCreateVariantButtonDisabled() {
        await this.waitForElementDisplayed(selectors.createButton);
        return await this.waitForElementDisabled(selectors.createButton);
    }

    async clickOnCreateVariantButton() {
        await this.waitForCreateVariantButtonEnabled();
        return await this.clickOnElement(selectors.createButton);
    }

    async waitForValidationPathMessageDisplayed() {
        try {
            await this.waitForElementDisplayed(selectors.validationMessage);
            return await this.getText(selectors.validationMessage);
        } catch (err) {
            await this.handleError(`Create Variant Dialog - validation message is not displayed`, 'err_variants_dlg_validation', err);
        }
    }

    async getDialogTitle() {
        return await this.getText(selectors.title);
    }

    async clickOnCloseButton() {
        await this.waitForElementDisplayed(selectors.closeButton);
        await this.clickOnElement(selectors.closeButton);
        return await this.waitForDialogClosed();
    }

    async waitForDialogLoaded() {
        try {
            await this.waitForElementDisplayed(selectors.dialog);
            await this.waitForElementDisplayed(selectors.variantNameInput);
        } catch (err) {
            await this.handleError(`Create Variant Dialog is not loaded`, 'err_variants_dlg', err);
        }
    }

    async waitForDialogClosed() {
        try {
            return await this.waitForElementNotDisplayed(selectors.dialog);
        } catch (err) {
            await this.handleError(`Create Variant Dialog is not closed`, 'err_variants_dlg', err);
        }
    }
}

module.exports = CreateVariantDialog;
