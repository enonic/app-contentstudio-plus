/**
 * Created on 04.11.2021.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'ArchiveDeleteDialog')]`,
    deleteButton: `//button[contains(@id,'DialogButton') and child::span[contains(.,'Delete')]]`,
    childListToDelete: "//ul[contains(@id,'ArchiveItemsList')]",
    header: `//div[contains(@id,'DefaultModalDialogHeader')]`,
    dialogItemList: "//ul[contains(@id,'ArchiveDialogItemList')]",
};

class ArchiveDeleteDialog extends Page {

    get title() {
        return XPATH.container + XPATH.header + "//h2[@class='title']";
    }

    get deleteButton() {
        return XPATH.container + XPATH.deleteButton;
    }

    get cancelButton() {
        return XPATH.container + lib.CANCEL_BUTTON_DIALOG;
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    getItemsToDeleteDisplayName() {
        let locator = XPATH.container + XPATH.dialogItemList + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(locator);
    }

    getChildItemsToDeleteDisplayName() {
        let locator = XPATH.container + XPATH.childListToDelete + lib.H6_DISPLAY_NAME;
        return this.getTextInElements(locator);
    }

    async clickOnCancelButton() {
        await this.waitForElementDisplayed(this.cancelButton, appConst.mediumTimeout);
        return await this.clickOnElement(this.cancelButton);
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(this.deleteButton, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_restore_dlg');
            throw new Error('Archive Delete dialog was not loaded! screenshot: ' + screenshot + ' ' + err);
        }
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout)
        } catch (error) {
            let screenshot = await this.saveScreenshotUniqueName('err_delete_dlg_close');
            throw new Error("Archive Delete dialog was not closed, screenshot:  " + screenshot + ' ' + err);
        }
    }

    getTitleInHeader() {
        return this.getText(this.title);
    }

    async clickOnDeleteButton() {
        await this.waitForDeleteButtonDisplayed();
        return await this.clickOnElement(this.deleteButton);
    }

    waitForDeleteButtonDisplayed() {
        return this.waitForElementDisplayed(this.deleteButton, appConst.mediumTimeout);
    }

    getChildItemsToDeletePath() {
        let locator = XPATH.container + XPATH.childListToDelete + lib.P_SUB_NAME;
        return this.getTextInElements(locator);
    }
}

module.exports = ArchiveDeleteDialog;
