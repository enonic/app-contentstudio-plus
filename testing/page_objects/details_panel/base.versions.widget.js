/**
 * Created on 04/07/2018.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const xpath = {
    versionsList: "//ul[contains(@id,'VersionHistoryList')]",
    versionItemExpanded: "//li[contains(@class,'version-list-item expanded')]",
    versionItem: "//li[contains(@class,'version-list-item') and not(contains(@class,'publish-action'))]",
    archivedItems: "//li[contains(@id,'VersionHistoryListItem')and descendant::h6[contains(.,'Archived')]]",
    restoredItems: "//li[contains(@id,'VersionHistoryListItem')and descendant::h6[contains(.,'Restored')]]",
    versionItemByDisplayName: displayName => `${lib.itemByDisplayName(displayName)}`,
    anyItemByHeader: header => `//li[contains(@class,'version-list-item') and descendant::h6[contains(.,'${header}')]]`,
    showChangesButtonLocator: ".//button[@title='Show changes']",
};

class BaseVersionsWidget extends Page {

    get compareWithCurrentVersionButton() {
        return this.versionsWidget + lib.COMPARE_WITH_CURRENT_VERSION;
    }

    get archivedItems() {
        return this.versionsWidget + xpath.versionsList + xpath.archivedItems;
    }

    async countVersionItems() {
        let items = await this.findElements(xpath.versionItem);
        return items.length;
    }

    //get all version items with the header then click on required item:
    async clickOnVersionItemByHeader(versionHeader, index) {
        try {
            let i = index === undefined ? 0 : index;
            await this.waitForElementDisplayed(this.versionItems, appConst.mediumTimeout);
            //get all version items with the header:
            let locator = xpath.anyItemByHeader(versionHeader);
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            let items = await this.findElements(locator);
            //click on the item:
            await items[i].click();
            return await this.pause(300);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_expand_version"));
            throw new Error("Error when clicking on the version item: " + err);
        }
    }

    //waits for Version Widget is loaded, Exception will be thrown after the timeout exceeded
    waitForVersionsLoaded() {
        return this.waitForElementDisplayed(this.versionsWidget, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot("err_load_versions_widget");
            throw new Error('Version Widget was not loaded in ' + appConst.mediumTimeout + " " + err);
        });
    }

    //waits for Version Widget is loaded, returns false after the timeout exceeded
    isWidgetLoaded() {
        return this.waitForElementDisplayed(this.versionsWidget, appConst.mediumTimeout).catch(err => {
            return false;
        });
    }

    async isRevertButtonDisplayed() {
        try {
            let locator = xpath.versionsList + "//button[child::span[text()='Revert']]";
            let res = await this.getDisplayedElements(locator);
            return res.length > 0;
        } catch (err) {
            await this.saveScreenshot("revert_version_button");
            throw new Error("Version Widget - " + err);
        }
    }

    async isActiveVersionButtonDisplayed() {
        try {
            let locator = xpath.versionsList + "//button[child::span[text()='Active version']]";
            let res = await this.getDisplayedElements(locator);
            return res.length > 0;
        } catch (err) {
            await this.saveScreenshot("active_version_button");
            throw new Error("Version Widget -  " + err);
        }
    }

    async waitForPublishedWidgetItemVisible() {
        return await this.waitForElementDisplayed(this.publishActionItems, appConst.mediumTimeout);
    }

    async getContentStatus() {
        let locator = this.versionsWidget + "/div[contains(@class,'status')]";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator);
    }

    async clickOnCompareWithCurrentVersionButton(index) {
        try {
            //wait for the list of versions is loaded:
            await this.waitForElementDisplayed(this.versionsWidget + xpath.versionsList, appConst.mediumTimeout);
            let elements = await this.findElements(this.compareWithCurrentVersionButton);
            await elements[index].click();
            return await this.pause(400);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_versions_widget"));
            throw new Error("Version Widget - error when clicking on CompareWithCurrentVersionButton " + err);
        }
    }

    async clickOnShowChangesButtonByHeader(itemHeader, index) {
        try {
            let itemLocator = this.versionsWidget + xpath.anyItemByHeader(itemHeader);
            let versionItems = await this.findElements(itemLocator);
            let buttonElements = await versionItems[index].$$(xpath.showChangesButtonLocator);
            await buttonElements[0].click();
            return await this.pause(200);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_click_on_compare"));
            throw new Error("Version Widget - error when clicking on CompareWithCurrentVersionButton " + err);
        }
    }

    versionItemByDisplayName(displayName) {
        return this.versionsWidget + xpath.versionsList + xpath.versionItemByDisplayName(displayName);
    }

    async getArchivedBy(index) {
        let locator = this.versionsWidget + xpath.archivedItems + lib.P_SUB_NAME;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        let elements = await this.findElements(locator);
        return await elements[index].getText();
    }

    async getRestoredBy(index) {
        let locator = this.versionsWidget + xpath.restoredItems + lib.P_SUB_NAME;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        let elements = await this.findElements(locator);
        return await elements[index].getText();
    }

    async isShowChangesInVersionButtonDisplayed(itemHeader, index) {
        let itemLocator = this.versionsWidget + xpath.anyItemByHeader(itemHeader);
        let elements = await this.findElements(itemLocator);
        let buttonElements = await elements[index].$$(xpath.showChangesButtonLocator);
        return buttonElements.length > 0;
    }
}

module.exports = BaseVersionsWidget;


