/**
 * Created on 21.02.2023 updated on 31.08.2026
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const DIALOG = `div[data-component="DuplicateVariantDialog"]`;

const selectors = {
    dialog: DIALOG,
    title: `${DIALOG} h2[data-component="Dialog.Title"]`,
    // The dialog has no Cancel button, it is closed with the 'X' button in the header:
    closeButton: `${DIALOG} button[data-component="Dialog.DefaultClose"]`,
    // The body contains the only item to duplicate - its display name and path:
    itemDisplayName: `${DIALOG} div[data-component="Dialog.Body"] div[class*="font-semibold"][class*="truncate"]`,
    itemPath: `${DIALOG} div[data-component="Dialog.Body"] div[class*="text-subtle"][class*="truncate"]`,
    duplicateButton: `${DIALOG} footer[data-component="Dialog.Footer"] button[data-component="Button"]`,
};

class DuplicateVariantDialog extends Page {

    async clickOnDuplicateButton() {
        await this.waitForElementDisplayed(selectors.duplicateButton, appConst.mediumTimeout);
        return await this.clickOnElement(selectors.duplicateButton);
    }

    async clickOnCloseButton() {
        await this.waitForElementDisplayed(selectors.closeButton);
        await this.clickOnElement(selectors.closeButton);
        return await this.waitForClosed();
    }

    async getDialogTitle() {
        return await this.getText(selectors.title);
    }

    async getItemDisplayName() {
        return await this.getText(selectors.itemDisplayName);
    }

    async getItemPath() {
        return await this.getText(selectors.itemPath);
    }

    async waitForLoaded() {
        try {
            await this.waitForElementDisplayed(selectors.dialog);
            await this.waitForElementDisplayed(selectors.duplicateButton);
        } catch (err) {
            await this.handleError('Duplicate Variant Dialog is not loaded', 'err_duplicate_variant_dlg', err);
        }
    }

    async waitForClosed() {
        try {
            return await this.waitForElementNotDisplayed(selectors.dialog);
        } catch (err) {
            await this.handleError('Duplicate Variant Dialog is not closed', 'err_duplicate_variant_dlg', err);
        }
    }
}

module.exports = DuplicateVariantDialog;
