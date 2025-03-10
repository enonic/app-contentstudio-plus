/**
 * Created on 10/09/2020.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: `//div[contains(@id,'LayersContentTreeDialog')]`,
    title: `//h2[@class='title']`,
    layersTreeList: `//ul[contains(@id,'LayersContentTreeList')]`,
    itemView: `//div[contains(@id,'LayerContentViewDataBlock')]`,
    layerByName: name => {
        return `//div[@class='layer-name' and contains(.,'${name}')]`
    },
    layerDataBlockByName: layerName => {
        return `//div[contains(@id,'LayerContentViewDataBlock') and descendant::div[contains(@class,'layer-name') and contains(.,'${layerName}')]]`;
    }
};

class LayersContentTreeDialog extends Page {

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    async clickOnCancelButtonTop() {
        try {
            await this.clickOnElement(this.cancelButtonTop);
            return await this.waitForDialogClosed();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_layers_tree_click_on_cancel_button');
            throw new Error(`Layers Content Tree dialog, error when clicking on Cancel(Top) button, screenshot:${screenshot}  ` + err);
        }
    }

    async waitForDialogLoaded() {
        try {
            let selector = XPATH.container + XPATH.layersTreeList;
            await this.waitForElementDisplayed(selector, appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_layers_tree_dialog');
            throw new Error(`Layers Content Tree dialog dialog should be opened! screenshot:${screenshot}` + err);
        }
    }

    isDialogLoaded() {
        return this.isElementDisplayed(XPATH.container);
    }

    async waitForDialogClosed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.container, appConst.shortTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_layers_tree_dialog_closed');
            throw new Error(`Layers Content Tree dialog should be closed ${screenshot} ` + err);
        }
    }

    async getTitle() {
        return await this.getText(XPATH.container + XPATH.title);
    }

    async getLayersName() {
        let locator = XPATH.container + XPATH.itemView + `//div[@class='layer-name']`;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getTextInElements(locator);

    }

    async waitForCancelButtonTopDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.cancelButtonTop, appConst.shortTimeout);
        } catch (err) {
            throw new Error('Layers Content Tree dialog dialog - Cancel button is not displayed :' + err);
        }
    }

    async clickOnLayerByName(layerName) {
        let selector = XPATH.container + XPATH.layersTreeList + XPATH.itemView + XPATH.layerByName(layerName);
        await this.waitForElementDisplayed(selector, appConst.longTimeout);
        await this.clickOnElement(selector);
    }

    async getButtonLabelInItemView(layerName) {
        let itemLocator = XPATH.container + XPATH.layersTreeList + XPATH.layerDataBlockByName(layerName);
        let buttonLocator = itemLocator + `//button[contains(@id,'LayersContentActionButton')]`;
        await this.waitForElementDisplayed(buttonLocator, appConst.mediumTimeout);
        return await this.getText(buttonLocator + '//span');
    }

    async getContentStatus(layerName) {
        let locator = XPATH.container + XPATH.layersTreeList + XPATH.layerDataBlockByName(layerName) + `//div[contains(@id,'LayerContentViewHeader')]//div[contains(@class,'status')]`;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getTextInElements(locator);
    }
}

module.exports = LayersContentTreeDialog;

