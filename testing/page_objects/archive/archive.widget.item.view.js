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
            await this.handleError('Archive Widget Item View - wait for not displayed', 'err_widget_item_not_displayed', err);
        }
    }

    async waitForWorkflowStateNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.workInProgressIcon, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Archive Widget Item View - checking workflow state not displayed', 'err_check_workflow_state', err);
        }
    }
}

module.exports = ArchiveContentWidgetItemView;


