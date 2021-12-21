/**
 * Created on 06.12.2021
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ArchiveItemStatisticsPanel')]",
    archiveToolbar: "//div[contains(@id,'ArchiveItemPreviewToolbar')]",
    archiveStatus: "//div[@class='archived']",
    originalPath: "//span[contains(@class,'original-path-value')]",
};

class ArchiveItemStatisticsPanel extends Page {

    get archiveStatus() {
        return XPATH.container + XPATH.archiveToolbar + XPATH.archiveStatus;
    }

    get originalPath() {
        return XPATH.container + XPATH.archiveToolbar + XPATH.originalPath;
    }

    async getPath() {
        try {
            await this.waitForElementDisplayed(this.originalPath, appConst.mediumTimeout);
            return await this.getText(this.originalPath);
        } catch (err) {
            this.saveScreenshot('err_get_archive_path');
            throw new Error('error when getting archive path' + err);
        }
    }

    async getStatus() {
        try {
            await this.waitForElementDisplayed(this.archiveStatus, appConst.mediumTimeout);
            return await this.getText(this.archiveStatus);
        } catch (err) {
            this.saveScreenshot('err_get_archive_status');
            throw new Error('error when getting archive status' + err);
        }
    }

    async waitForPanelCleared() {
        await this.waitForElementNotDisplayed(this.originalPath, appConst.mediumTimeout);
        return await this.waitForElementNotDisplayed(this.archiveStatus, appConst.mediumTimeout);
    }
}

module.exports = ArchiveItemStatisticsPanel;
