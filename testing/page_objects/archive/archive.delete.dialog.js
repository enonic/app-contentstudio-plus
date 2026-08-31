/**
 * Created on 04.11.2021.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const {BUTTONS} = require('../../libs/elements');

const XPATH = {
    container: `//div[@data-component='ArchiveDeleteDialog']`,
    title: `//header[@data-component='Dialog.DefaultHeader']//h2[@data-component='Dialog.Title']`,
    description: `//header[@data-component='Dialog.DefaultHeader']//p[@data-component='Dialog.Description']`,
    body: `//div[@data-component='Dialog.Body']`,
    // The main items to delete are displayed in the first ul in the body:
    itemsList: `//div[@data-component='Dialog.Body']/ul`,
    // Dependent items are displayed in the ul below the separator:
    dependantItemsList: `//div[@data-component='Dialog.Body']/div/ul`,
    listItem: `//div[@data-component='ListItem']`,
    contentLabel: `//div[@data-component='ContentLabel']`,
    primaryText: `//span[contains(@class,'font-semibold')]`,
    secondaryText: `//small`,
    // svg elements are in the SVG namespace, so the 'svg' node test does not match them in xpath:
    statusIcon: `//*[local-name()='svg' and @data-component='StatusIcon']`,
};

class ArchiveDeleteDialog extends Page {

    get title() {
        return XPATH.container + XPATH.title;
    }

    get description() {
        return XPATH.container + XPATH.description;
    }

    // The label of the button contains the number of items to delete, when more than one item will be deleted: 'Delete (12)'
    get deleteButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Delete');
    }

    get closeButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Close');
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(XPATH.container);
            await this.waitForElementDisplayed(this.deleteButton);
        } catch (err) {
            await this.handleError('Archive Delete dialog', 'err_archive_delete_dlg_opened', err);
        }
    }

    async waitForClosed() {
        try {
            await this.waitForElementNotDisplayed(XPATH.container, appConst.longTimeout);
        } catch (err) {
            await this.handleError('Archive Delete dialog', 'err_archive_delete_dlg_close', err);
        }
    }

    getTitleInHeader() {
        return this.getText(this.title);
    }

    // Subtitle in the header - 'Delete selected items from the Archive'
    getSubtitleInHeader() {
        return this.getText(this.description);
    }

    async clickOnCloseButton() {
        await this.waitForElementDisplayed(this.closeButton);
        return await this.clickOnElement(this.closeButton);
    }

    async clickOnDeleteButton() {
        await this.waitForDeleteButtonDisplayed();
        return await this.clickOnElement(this.deleteButton);
    }

    async waitForDeleteButtonDisplayed() {
        return await this.waitForElementDisplayed(this.deleteButton);
    }

    // The button is disabled with the 'aria-disabled' attribute, so 'waitForElementEnabled' can not be used here
    async waitForDeleteButtonEnabled() {
        try {
            await this.waitForDeleteButtonDisplayed();
            return await this.waitForAttributeNotIncludesValue(this.deleteButton, 'aria-disabled', 'true');
        } catch (err) {
            await this.handleError(`Archive Delete dialog - 'Delete' button should be enabled`, 'err_archive_delete_btn', err);
        }
    }

    async waitForDeleteButtonDisabled() {
        try {
            await this.waitForDeleteButtonDisplayed();
            return await this.waitForAttributeHasValue(this.deleteButton, 'aria-disabled', 'true');
        } catch (err) {
            await this.handleError(`Archive Delete dialog - 'Delete' button should be disabled`, 'err_archive_delete_btn', err);
        }
    }

    // Returns the label of the button: 'Delete' or 'Delete (12)'
    getTextInDeleteButton() {
        return this.getText(this.deleteButton);
    }

    // Display names of the main items to delete
    async getItemsToDeleteDisplayName() {
        let locator = XPATH.container + XPATH.itemsList + XPATH.contentLabel + XPATH.primaryText;
        return await this.getTextInElements(locator);
    }

    // Short path of the main items to delete
    async getItemsToDeletePath() {
        let locator = XPATH.container + XPATH.itemsList + XPATH.contentLabel + XPATH.secondaryText;
        return await this.getTextInElements(locator);
    }

    // Dependent items are displayed in the 'compact' variant of ContentLabel, so the full path is displayed in the primary text
    async getChildItemsToDeletePath() {
        let locator = XPATH.container + XPATH.dependantItemsList + XPATH.contentLabel + XPATH.primaryText;
        return await this.getTextInElements(locator);
    }

    async getNumberOfItemsToDelete() {
        let locator = XPATH.container + XPATH.itemsList + XPATH.listItem;
        let items = await this.findElements(locator);
        return items.length;
    }

    async getNumberOfChildItemsToDelete() {
        let locator = XPATH.container + XPATH.dependantItemsList + XPATH.listItem;
        let items = await this.findElements(locator);
        return items.length;
    }

    // Returns the workflow state of the item: 'in-progress', 'ready' or '' when the status icon is not displayed
    async getWorkflowStateOfItem(displayName) {
        let locator = XPATH.container + XPATH.itemsList + XPATH.contentLabel +
                      `[descendant::span[contains(.,'${displayName}')]]` + XPATH.statusIcon;
        let icons = await this.findElements(locator);
        if (icons.length === 0) {
            return '';
        }
        return await icons[0].getAttribute('aria-label');
    }
}

module.exports = ArchiveDeleteDialog;
