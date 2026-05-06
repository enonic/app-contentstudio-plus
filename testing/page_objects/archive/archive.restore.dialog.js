/**
 * Created on 5.11.2021
 */
const Page = require('../page');
const {BUTTONS} = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[@data-component='ArchiveRestoreDialog']`,
    restoreButton: `//button[contains(@id,'DialogButton') and child::span[contains(.,'Restore')]]`,
    itemListToRestore: "//ul[contains(@id,'ArchiveDialogItemList')]",
    childListToRestore: "//ul[contains(@id,'ArchiveItemsList')]",
    header: `//header`,
    contentTypeByName(name) {
        return `//div[@class='content-types-content']//li[contains(@class,'content-types-list-item') and descendant::h6[contains(@class,'main-name') and contains(.,'${name}')]]`;
    },
};

class ArchiveRestoreDialog extends Page {

    get title() {
        return XPATH.container + XPATH.header + "//h2";
    }

    get restoreButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Restore');
    }

    get closeButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Close');
    }


    async clickOnCloseButton() {
        await this.waitForElementDisplayed(this.closeButton, appConst.mediumTimeout);
        return await this.clickOnElement(this.closeButton);
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(this.restoreButton, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('Restore from Archive dialog', 'err_archive_restore_dlg_opened', err);
        }
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(XPATH.container, appConst.longTimeout);
        } catch (err) {
            await this.handleError('Restore from Archive dialog was not closed', 'err_restore_dlg_close', err);
        }
    }

    getTitleInHeader() {
        return this.getText(this.title);
    }

    async clickOnRestoreButton() {
        await this.waitForRestoreButtonDisplayed();
        return await this.clickOnElement(this.restoreButton);
    }

    waitForRestoreButtonDisplayed() {
        return this.waitForElementDisplayed(this.restoreButton, appConst.mediumTimeout);
    }

    getChildItemsToRestorePath() {
        let locator = XPATH.container + XPATH.childListToRestore + lib.P_SUB_NAME;
        return this.getTextInElements(locator);
    }
}

module.exports = ArchiveRestoreDialog;
