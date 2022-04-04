/**
 * Created on 08.12.2021
 */
const BaseVersionsWidget = require('../details_panel/base.versions.widget');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const XPATH = {
    widget: "//div[contains(@id,'ArchiveBrowsePanel')]//div[contains(@id,'VersionHistoryView')]",
    versionsList: "//ul[contains(@id,'VersionHistoryList')]",
    versionItem: "//li[contains(@class,'version-list-item') and child::div[contains(@class,'version-viewer')]]",
    archivedItems: "//li[contains(@id,'VersionHistoryListItem')and descendant::h6[contains(.,'Archived')]]",
    restoredItems: "//li[contains(@id,'VersionHistoryListItem')and descendant::h6[contains(.,'Restored')]]",
};

class ArchivedContentVersionsWidget extends BaseVersionsWidget {

    get versionsWidget() {
        return XPATH.widget;
    }

    get versionItems() {
        return this.versionsWidget + XPATH.versionsList + XPATH.versionItem;
    }

    get archivedItems() {
        return this.versionsWidget + XPATH.versionsList + XPATH.archivedItems;
    }

    async getStatusInArchivedItem(index) {
        let locator = XPATH.widget + XPATH.archivedItems + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        let elements = await this.findElements(locator);
        return await elements[index].getText();
    }
}

module.exports = ArchivedContentVersionsWidget;
