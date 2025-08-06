/**
 * Created on 09/09/2020.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const xpath = {
    layersItemViewDiv: "//div[contains(@class,'layers-item-view-data')]",
    localizeButton: "//div[contains(@class,'data-footer')]//button[child::span[text()='Localize']]",
    editButton: "//div[contains(@class,'data-footer')]//button[child::span[text()='Edit']]",
    openButton: "//div[contains(@class,'data-footer')]//button[child::span[text()='Open']]",
    layerDetailsDiv: "//div[contains(@id,'LayerContentViewHeader')]/div[contains(@class,'layer-details')]",
    layerLanguageDiv: "//div[@class='layer-language']",
    layerNameDiv: "//div[@class='layer-name']",
    layerViewByName: layerName => `//div[contains(@class,'layers-item-view-data') and descendant::div[@class='layer-name' and text()='${layerName}']]`,
};

class BaseLayersWidget extends Page {

    isWidgetVisible() {
        return this.isElementDisplayed(this.layersWidget);
    }

    async waitForWidgetLoaded() {
        try {
            return await this.waitForElementDisplayed(this.layersWidget, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Layer Widget was not loaded', 'err_layer_widget_loaded', err);
        }
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
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.localizeButton;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.waitForElementEnabled(locator, appConst.mediumTimeout);
    }

    async waitForLocalizeButtonDisabled(layerName) {
        let locator1 = this.widgetItemView + xpath.layerViewByName(layerName) +
                       "/following-sibling::div[contains(@id,'LayerContentViewFooter')]/button[child::span[text()='Localize']]";
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.localizeButton;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.waitForElementDisabled(locator, appConst.mediumTimeout);
    }

    async waitForEditButtonEnabled(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.editButton;
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.waitForElementEnabled(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Layers Widget - 'Edit' button should be enabled, layer: ${layerName}`, 'err_widget_edit_btn', err);
        }
    }

    async waitForOpenButtonEnabled(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.openButton;
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.waitForElementEnabled(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Layers Widget - 'Open' button should be enabled,  layer: ${layerName}`, 'err_widget_item_open', err);
        }
    }

    async clickOnLocalizeButton(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.localizeButton;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.clickOnElement(locator);
    }

    // Gets the string 'layer611610(en)' from the layer-item  for the current selected content
    async getContentNameWithLanguage(layerName) {
        let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                      "//div[contains(@id,'LangBasedContentSummaryViewer')]" + lib.H6_DISPLAY_NAME;
        let locatorName = locator + "//span[@class='display-name']";
        let locatorPostfix = locator + "//span[@class='display-name-postfix']";
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);

        let displayName = await this.getText(locatorName);
        let postfix = await this.getText(locatorPostfix);
        return displayName + postfix;
    }

    async getContentStatus(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) +
                          "//div[contains(@id,'LayerContentViewHeader')]//div[contains(@class,'status')]";
            await this.waitForElementDisplayed(locator);
            return await this.getText(locator);
        } catch (err) {
            await this.handleError(`Tried to get content status for layer: ${layerName}`, 'err_widget_content_status', err);
        }
    }

    async clickOnWidgetItem(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName);
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.clickOnElement(locator);
        } catch (err) {
            await this.handleError(`Tried to click on widget item for layer: ${layerName}`, 'err_widget_item', err);
        }
    }

    async clickOnOpenButton(layerName) {
        try {
            let locator = this.widgetItemView + xpath.layerViewByName(layerName) + xpath.openButton;
            await this.waitForOpenButtonEnabled(layerName);
            await this.clickOnElement(locator);
            await this.pause(700);
        } catch (err) {
            await this.handleError(`Tried to click on Open button for layer: ${layerName}`, 'err_widget_item_open', err);
        }
    }
}

module.exports = BaseLayersWidget;
