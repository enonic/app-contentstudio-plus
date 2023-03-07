/**
 * Created on 09/09/2020.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');
const LayersContentTreeDialog = require('../project/layers.content.tree.dialog');

const xpath = {
    showAllButton: "//button[contains(@id,'ShowAllContentLayersButton')]",
    layerViewByName:
        layerName => `//div[contains(@id,'LayerContentViewHeader') and descendant::div[@class='layer-name' and text()='${layerName}']]`,
    layerDetailsDiv: "//div[contains(@id,'LayerContentViewHeader')]/div[contains(@class,'layer-details')]",
    layerLanguageDiv: "//div[@class='layer-language']",
    layerNameDiv: "//div[@class='layer-name']",
    openButton: "/following-sibling::div[contains(@id,'LayerContentViewFooter')]/button[child::span[text()='Open']]",
};

class BaseLayersWidget extends Page {

    get showAllButton() {
        return this.layersWidget + xpath.showAllButton;
    }

    isWidgetVisible() {
        return this.isElementDisplayed(this.layersWidget);
    }

    waitForWidgetLoaded() {
        return this.waitForElementDisplayed(this.layersWidget, appConst.shortTimeout).catch(err => {
            throw new Error('Browse Panel: Layers Widget is not loaded in ' + appConst.shortTimeout);
        });
    }

    async getLayersName() {
        let locator = this.widgetItemView + xpath.layerDetailsDiv + xpath.layerNameDiv;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getTextInElements(locator);
    }

    getLayerLanguage(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.layerLanguageDiv;
        return this.getText(locator);
    }

    async waitForLocalizeButtonEnabled(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                      "/following-sibling::div[contains(@id,'LayerContentViewFooter')]/button[child::span[text()='Localize']]";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.waitForElementEnabled(locator, appConst.mediumTimeout);
    }

    async waitForLocalizeButtonDisabled(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                      "/following-sibling::div[contains(@id,'LayerContentViewFooter')]/button[child::span[text()='Localize']]";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.waitForElementDisabled(locator, appConst.mediumTimeout);
    }

    async waitForEditButtonEnabled(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                          "/following-sibling::div[contains(@id,'LayerContentViewFooter')]/button[child::span[text()='Edit']]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.waitForElementEnabled(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_edit_btn_widget');
            await this.saveScreenshot(screenshot);
            throw new Error("Layer widget - Error 'Edit' button in the layer view item, screenshot: " + screenshot + ' ' + err);
        }
    }

    async clickOnWidgetItem(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName);
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.clickOnElement(locator);
        } catch (err) {
            let screenshot = appConst.generateRandomName('widget_item');
            await this.saveScreenshot(screenshot);
            throw new Error("Error after clicking on the widget-item, screenshot: " + screenshot + ' ' + err);
        }
    }

    async waitForOpenButtonEnabled(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.openButton;
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.waitForElementEnabled(locator, appConst.mediumTimeout);
        } catch (err) {
            throw new Error("Error getting button in the layer view item: " + err);
        }
    }

    async clickOnOpenButton(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.openButton;
            await this.waitForOpenButtonEnabled(layerName);
            await this.clickOnElement(locator);
            await this.pause(700);
        } catch (err) {
            let screenshot = appConst.generateRandomName('widget_item_open');
            await this.saveScreenshot(screenshot);
            throw new Error("Error after clicking on the Open button, screenshot: " + screenshot + ' ' + err);
        }
    }

    async clickOnLocalizeButton(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                      "/following-sibling::div[contains(@id,'LayerContentViewFooter')]/button/span[text()='Localize']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
        return await this.pause(1000);
    }

    async waitForShowAllButtonDisplayed() {
        return await this.waitForElementDisplayed(this.showAllButton, appConst.mediumTimeout);
    }

    async clickOnShowAllButton(layerName) {
        let layersContentTreeDialog = new LayersContentTreeDialog();
        await this.waitForShowAllButtonDisplayed();
        await this.clickOnElement(this.showAllButton);
        await layersContentTreeDialog.waitForDialogLoaded();
        return layersContentTreeDialog;
    }

    async getContentNameWithLanguage(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                      "/following-sibling::div[contains(@id,'LayerContentViewBody')]" +
                      "//div[contains(@id,'LangBasedContentSummaryViewer')]" + lib.H6_DISPLAY_NAME;
        let locatorName = locator + "//span[@class='display-name']";
        let locatorPostfix = locator + "//span[@class='display-name-postfix']";
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);

        let displayName = await this.getText(locatorName);
        let postfix = await this.getText(locatorPostfix);
        return displayName + postfix;
    }

    async getContentStatus(layerName) {
        let locator = this.widgetItemView + "//div[contains(@id,'LayerContentViewHeader')]//div[contains(@class,'status')]";
        await this.waitForElementDisplayed(locator);
        return await this.getText(locator);
    }
}

module.exports = BaseLayersWidget;
