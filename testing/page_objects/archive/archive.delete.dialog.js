/**
 * Created on 04.11.2021.
 */
const Page = require('../page');
const {BUTTONS, TREE_GRID} = require('../../libs/elements');

const XPATH = {
    container: `//div[@data-component='ArchiveDeleteDialog']`,
    childListToDelete: "//ul[contains(@id,'ArchiveItemsList')]",
    header: `//header/h2`,
    dialogItemList: "//ul[contains(@id,'ArchiveDialogItemList')]",
};

class ArchiveDeleteDialog extends Page {

    get title() {
        return XPATH.container + XPATH.header;
    }

    get deleteButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Delete');
    }

    get closeButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Close');
    }

    async clickOnCloseButton() {
        return await this.clickOnElement(this.closeButton);
    }

    async getItemsToDeleteDisplayName() {
        let locator = XPATH.container + TREE_GRID.CONTENT_LABEL_BLOCK + '//div[2]//span';
        return await this.getTextInElements(locator);
    }

    async clickOnCancelButton() {
        await this.waitForElementDisplayed(this.cancelButton);
        return await this.clickOnElement(this.cancelButton);
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(this.deleteButton);
        } catch (err) {
            await this.handleError('Archive Delete dialog', 'err_archive_delete_dlg_opened', err);
        }
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(XPATH.container);
        } catch (err) {
            await this.handleError('Archive Delete dialog', 'err_archive_delete_dlg_close', err);
        }
    }

    getTitleInHeader() {
        return this.getText(this.title);
    }

    async clickOnDeleteButton() {
        await this.waitForDeleteButtonDisplayed();
        return await this.clickOnElement(this.deleteButton);
    }

    async waitForDeleteButtonDisplayed() {
        return await this.waitForElementDisplayed(this.deleteButton);
    }

    getChildItemsToDeletePath() {
        let locator = XPATH.container + XPATH.childListToDelete + lib.P_SUB_NAME;
        return this.getTextInElements(locator);
    }
}

module.exports = ArchiveDeleteDialog;
