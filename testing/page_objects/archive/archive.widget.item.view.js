/**
 * Created on 20/12/2021
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const xpath = {
    container: `//div[contains(@id,'WidgetView')]//div[contains(@id,'ArchiveWidgetItemView')]`,
    nameView: "//div[contains(@id,'NamesAndIconView')]",
    workInProgressIcon: "//div[@title='Work in progress' or @title='Ready for publishing']"
};

class ArchiveContentWidgetItemView extends Page {

    async getContentName() {
        let selector = xpath.container + xpath.nameView + lib.P_SUB_NAME;
        await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
        return await this.getText(selector);
    }

    async getContentDisplayName() {
        let selector = xpath.container + xpath.nameView + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
        return await this.getText(selector);
    }

    isDisplayed() {
        return this.isElementDisplayed(xpath.container);
    }

    async waitForNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.container, appConst.shortTimeout);
        } catch (err) {
            await this.saveScreenshot("err_widget_item_is_visible");
            throw new Error("Widget Item should not be displayed " + err);
        }
    }

    async waitForWorkflowStateNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.workInProgressIcon, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName("err_widget_item_workflow");
            throw new Error("Workflow state should not be displayed in the archive widget item, screenshot " + screenshot + ' ' + err);
        }
    }
}

module.exports = ArchiveContentWidgetItemView;


