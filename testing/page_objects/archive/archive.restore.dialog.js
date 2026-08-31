/**
 * Created on 5.11.2021
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const {BUTTONS} = require('../../libs/elements');

const XPATH = {
    container: `//div[@data-component='ArchiveRestoreDialog']`,
    title: `//header[@data-component='Dialog.DefaultHeader']//h2[@data-component='Dialog.Title']`,
    description: `//header[@data-component='Dialog.DefaultHeader']//p[@data-component='Dialog.Description']`,
    body: `//div[@data-component='Dialog.Body']`,
    // The main items to restore are displayed in the first ul in the body:
    itemsList: `//div[@data-component='Dialog.Body']/ul`,
    // Dependent items are displayed in the ul below the separator:
    dependantItemsList: `//div[@data-component='Dialog.Body']/div/ul`,
    // 'Other content items that will be restored':
    separatorLabel: `//div[@data-component='Separator']/span[1]`,
    listItem: `//div[@data-component='ListItem']`,
    contentLabel: `//div[@data-component='ContentLabel']`,
    // 'normal' variant of ContentLabel(main items) shows the display name in the span and the short path in the small,
    // 'compact' variant(dependent items) shows the full path in the span
    primaryText: `//span[contains(@class,'font-semibold')]`,
    secondaryText: `//small`,
    // svg elements are in the SVG namespace, so the 'svg' node test does not match them in xpath:
    statusIcon: `//*[local-name()='svg' and @data-component='StatusIcon']`,
};

class ArchiveRestoreDialog extends Page {

    get title() {
        return XPATH.container + XPATH.title;
    }

    get description() {
        return XPATH.container + XPATH.description;
    }

    // The label of the button contains the number of items to restore, when more than one item will be restored: 'Restore (12)'
    get restoreButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Restore');
    }

    get closeButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Close');
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(XPATH.container);
            await this.waitForElementDisplayed(this.restoreButton);
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

    // Subtitle in the header - 'Restore selected content items to the root of the Content grid'
    getSubtitleInHeader() {
        return this.getText(this.description);
    }

    async clickOnCloseButton() {
        await this.waitForElementDisplayed(this.closeButton);
        return await this.clickOnElement(this.closeButton);
    }

    async clickOnRestoreButton() {
        await this.waitForRestoreButtonDisplayed();
        return await this.clickOnElement(this.restoreButton);
    }

    async waitForRestoreButtonDisplayed() {
        return await this.waitForElementDisplayed(this.restoreButton);
    }

    // The button is disabled with the 'aria-disabled' attribute, so 'waitForElementEnabled' can not be used here
    async waitForRestoreButtonEnabled() {
        try {
            await this.waitForRestoreButtonDisplayed();
            return await this.waitForAttributeNotIncludesValue(this.restoreButton, 'aria-disabled', 'true');
        } catch (err) {
            await this.handleError(`Restore from Archive dialog - 'Restore' button should be enabled`, 'err_archive_restore_btn', err);
        }
    }

    async waitForRestoreButtonDisabled() {
        try {
            await this.waitForRestoreButtonDisplayed();
            return await this.waitForAttributeHasValue(this.restoreButton, 'aria-disabled', 'true');
        } catch (err) {
            await this.handleError(`Restore from Archive dialog - 'Restore' button should be disabled`, 'err_archive_restore_btn', err);
        }
    }

    // Returns the label of the button: 'Restore' or 'Restore (12)'
    getTextInRestoreButton() {
        return this.getText(this.restoreButton);
    }

    // Display names of the main items to restore
    async getItemsToRestoreDisplayName() {
        let locator = XPATH.container + XPATH.itemsList + XPATH.contentLabel + XPATH.primaryText;
        return await this.getTextInElements(locator);
    }

    // Short path of the main items to restore
    async getItemsToRestorePath() {
        let locator = XPATH.container + XPATH.itemsList + XPATH.contentLabel + XPATH.secondaryText;
        return await this.getTextInElements(locator);
    }

    // Dependent items are displayed in the 'compact' variant of ContentLabel, so the full path is displayed in the primary text
    async getChildItemsToRestorePath() {
        let locator = XPATH.container + XPATH.dependantItemsList + XPATH.contentLabel + XPATH.primaryText;
        return await this.getTextInElements(locator);
    }

    // Label of the separator above the dependent items - 'Other content items that will be restored'
    async getDependantItemsSectionLabel() {
        let locator = XPATH.container + XPATH.separatorLabel;
        await this.waitForElementDisplayed(locator);
        return await this.getText(locator);
    }

    async getNumberOfItemsToRestore() {
        let locator = XPATH.container + XPATH.itemsList + XPATH.listItem;
        let items = await this.findElements(locator);
        return items.length;
    }

    async getNumberOfChildItemsToRestore() {
        let locator = XPATH.container + XPATH.dependantItemsList + XPATH.listItem;
        let items = await this.findElements(locator);
        return items.length;
    }

    // Returns the workflow state of the item: 'ready', 'in-progress', 'invalid' or '' when the status icon is not displayed
    async getWorkflowStateOfItem(displayName) {
        let locator = XPATH.container + XPATH.itemsList + XPATH.contentLabel +
                      `[descendant::span[contains(.,'${displayName}')]]` + XPATH.statusIcon;
        let icons = await this.findElements(locator);
        if (icons.length === 0) {
            return '';
        }
        return await icons[0].getAttribute('aria-label');
    }

    // Returns the workflow state of the dependent item, the full path is displayed in the label of the item
    async getWorkflowStateOfChildItem(path) {
        let locator = XPATH.container + XPATH.dependantItemsList + XPATH.contentLabel +
                      `[descendant::span[contains(.,'${path}')]]` + XPATH.statusIcon;
        let icons = await this.findElements(locator);
        if (icons.length === 0) {
            return '';
        }
        return await icons[0].getAttribute('aria-label');
    }
}

module.exports = ArchiveRestoreDialog;
