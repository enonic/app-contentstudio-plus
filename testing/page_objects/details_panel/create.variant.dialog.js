/**
 * Created  on 01.04.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const XPATH = {
    container: `//div[contains(@id,'CreateVariantDialog')]`,
    variantNameInputDiv: "//div[contains(@id,'VariantNameInput')]",
};

class CreateVariantDialog extends Page {

    get createVariantButton() {
        return XPATH.container + lib.dialogButton('Create Variant');
    }

    get variantNameInput() {
        return XPATH.container + XPATH.variantNameInputDiv + lib.TEXT_INPUT;
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    async typeTextInVariantNameInput(text) {
        await this.waitForElementDisplayed(this.variantNameInput, appConst.mediumTimeout);
        return await this.typeTextInInput(this.variantNameInput, text);
    }

    async waitForCreateVariantButtonEnabled() {
        await this.waitForElementDisplayed(this.createVariantButton, appConst.mediumTimeout);
        await this.waitForElementEnabled(this.createVariantButton, appConst.mediumTimeout);
    }

    async waitForCreateVariantButtonDisabled() {
        await this.waitForElementDisplayed(this.createVariantButton, appConst.mediumTimeout);
        await this.waitForElementDisabled(this.createVariantButton, appConst.mediumTimeout);
    }

    async waitForValidationPathMessageDisplayed() {
        let locator = XPATH.container + "//div[@class='status invalid']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator);
    }

    async clickOnCreateVariantButton() {
        await this.waitForElementDisplayed(this.createVariantButton, appConst.mediumTimeout);
        await this.waitForCreateVariantButtonEnabled();
        await this.clickOnElement(this.createVariantButton);
    }

    async clickOnCancelButtonTop() {
        await this.clickOnElement(this.cancelButtonTop);
        return await this.waitForDialogClosed();
    }

    async waitForDialogLoaded() {
        try {
            return await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_variants_dlg');
            await this.saveScreenshot(screenshot);
            throw new Error(`Create Variant Dialog is not loaded ${screenshot} ` + err);
        }
    }

    async waitForDialogClosed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_variants_dlg');
            await this.saveScreenshot(screenshot);
            throw new Error(`Create Variant Dialog is not closed ${screenshot} ` + err);
        }
    }
}

module.exports = CreateVariantDialog;
