/**
 * Created on 28/02/2020.
 */
const BaseVersionsWidget = require('../../details_panel/base.versions.widget');

const XPATH = {
    widget: "//div[contains(@id,'ContentBrowsePanel')]//div[contains(@id,'VersionHistoryView')]",
    versionsList: "//ul[contains(@id,'VersionHistoryList')]",
    versionItem: "//li[contains(@class,'version-list-item') and child::div[contains(@class,'version-viewer')]]",
    publishedItems: "//li[contains(@id,'VersionHistoryListItem')and descendant::h6[contains(.,'Published')]]",
};

class BrowseVersionsWidget extends BaseVersionsWidget {

    get versionsWidget() {
        return XPATH.widget;
    }

    get versionItems() {
        return this.versionsWidget + XPATH.versionsList + XPATH.versionItem;
    }

    get publishedItems() {
        return this.versionsWidget + XPATH.versionsList + XPATH.publishedItems;
    }
}

module.exports = BrowseVersionsWidget;
