/**
 * Created on 07.12.2021
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ArchiveBrowsePanel')]//div[contains(@id,'ArchiveStatusWidgetItemView')]`,
    status: "//span[contains(@class,'archived')]",
};

class ArchivedContentStatusWidget extends Page {

    get status() {
        return xpath.container + xpath.status;
    }

    async getStatus() {
        await this.waitForElementDisplayed(this.status, appConst.mediumTimeout);
        return await this.getText(this.status);
    }
}

module.exports = ArchivedContentStatusWidget;


