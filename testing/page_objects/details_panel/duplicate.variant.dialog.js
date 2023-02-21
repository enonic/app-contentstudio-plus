/**
 * Created on 21.02.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const xpath = {
    container: "//div[contains(@id,'DuplicateVariantDialog')]",
};

class DuplicateVariantDialog extends Page {

    get duplicateButton() {
        return `${xpath.container}` + lib.dialogButton('Duplicate');
    }

    get cancelButton() {
        return `${xpath.container}` + lib.dialogButton('Cancel');
    }

    async clickOnDuplicateButton() {
        await this.waitForElementDisplayed(this.duplicateButton, appConst.mediumTimeout);
        await this.clickOnElement(this.duplicateButton);
    }

    async clickOnCancelButton() {
        await this.waitForElementDisplayed(this.cancelButton, appConst.mediumTimeout);
        await this.clickOnElement(this.cancelButton);
    }

    waitForClosed() {
        this.waitForElementNotDisplayed(this.duplicateButton, appConst.mediumTimeout);
    }

    waitForLoaded() {
        this.waitForElementNotDisplayed(xpath.container, appConst.mediumTimeout);
    }

}

module.exports = DuplicateVariantDialog;


