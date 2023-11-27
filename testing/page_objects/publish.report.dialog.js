/**
 * Created on 03.11.2023
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const lib = require('../libs/elements');
const XPATH = {
    container: `//div[contains(@id,'PublishReportDialog')]`,
};

class PublishReportDialog extends Page {

    get showEntireContentCheckbox() {
        return XPATH.container + lib.SHOW_ENTIRE_CONTENT_CHECKBOX_DIV;
    }

    get printButton() {
        return XPATH.container + lib.dialogButton('Print');
    }

    get cancelTopButton() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    async isShowEntireContentCheckboxSelected(index) {
        let checkBoxInput = this.showEntireContentCheckbox + lib.CHECKBOX_INPUT;

        await this.waitForElementDisplayed(this.showEntireContentCheckbox, appConst.mediumTimeout);
        let res = await this.findElements(checkBoxInput);
        if(index > res.length){
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        return await res[index].isSelected();

    }

    async clickOnCancelTopButton() {
        await this.waitForElementDisplayed(this.cancelTopButton, appConst.shortTimeout);
        await this.clickOnElement(this.cancelTopButton);
        await this.waitForDialogClosed();
        return await this.pause(200);
    }

    async waitForDialogOpened() {
        try {
            return await this.waitForElementDisplayed(this.printButton, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_load_publish_report_dlg');
            throw new Error("PublishReport  dialog was not loaded! screenshot:  " + screenshot + ' ' + err);
        }
    }

    isDialogVisible() {
        return this.isElementDisplayed(XPATH.container);
    }

    async waitForDialogClosed() {
        await this.waitForElementNotDisplayed(XPATH.container, appConst.shortTimeout);
    }

}

module.exports = PublishReportDialog;
