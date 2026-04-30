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
            const host = await this.getWidgetShadowHost();
            const div = await host.shadow$(`div[id*='LayersExtension']`);
            await div.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('Layer Widget was not loaded', 'err_layer_widget_loaded', err);
        }
    }

    async findLayerItemViewDataByName(layerName) {
        let host = await this.getWidgetShadowHost();
        const items = await host.shadow$$('div.layers-item-view-data');
        for (const item of items) {
            const nameEl = await item.$('div.layer-name');
            if (await nameEl.isExisting()) {
                const text = await nameEl.getText();
                if (text.trim() === layerName) {
                    return item;
                }
            }
        }
        return null;
    }

    async clickOnWidgetItem(layerName) {
        try {
            let element = await this.findLayerItemViewDataByName(layerName);
            await element.click();
        } catch (err) {
            await this.handleError(`Tried to click on widget item for layer: ${layerName}`, 'err_widget_item', err);
        }
    }

    async getLayersName() {
        try {
            let host = await this.getWidgetShadowHost();
            let elements = await host.shadow$$('div[id*="LayerContentViewHeader"] > .layer-details .layer-name');
            const names = []
            for (const el of elements) {
                let text = await el.getText();
                names.push(text);
            }
            return names;
        } catch (err) {
            await this.handleError('Tried to get layers names', 'err_widget_layers_names', err);
        }
    }

    async getLayerLanguage(layerName) {
        try {
            const item = await this.findLayerItemViewDataByName(layerName);
            const el = await item.$('.//div[@class="layer-language"]');
            return el.getText();
        } catch (err) {
            await this.handleError(`Tried to get layer language for layer: ${layerName}`, 'err_widget_layer_language', err);
        }
    }

    async waitForLocalizeButtonEnabled(layerName) {
        try {
            const item = await this.findLayerItemViewDataByName(layerName);
            const button = await item.$('.//div[contains(@id,"LayerContentViewFooter")]//button[.//span[text()="Localize"]]');
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`Layers Widget - 'Localize' button should be displayed and enabled`, 'err_widget_localize_btn', err);
        }
    }

    async waitForLocalizeButtonDisabled(layerName) {
        const item = await this.findLayerItemViewDataByName(layerName);
        const button = await item.$('.//div[contains(@id,"LayerContentViewFooter")]//button[.//span[text()="Localize"]]');
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await button.waitForEnabled({timeout: appConst.mediumTimeout, reverse: true});
    }

    async waitForEditButtonEnabled(layerName) {
        try {
            const item = await this.findLayerItemViewDataByName(layerName);
            const button = await item.$('.//div[contains(@id,"LayerContentViewFooter")]//button[.//span[text()="Edit"]]');
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`Layers Widget - 'Edit' button should be enabled, layer: ${layerName}`, 'err_widget_edit_btn', err);
        }
    }

    async waitForOpenButtonEnabled(layerName) {
        try {
            const item = await this.findLayerItemViewDataByName(layerName);
            const button = await item.$('.//div[contains(@id,"LayerContentViewFooter")]//button[.//span[text()="Open"]]');
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            throw new Error("Error getting button in the layer view item: " + err);
        }
    }

    async clickOnLocalizeButton(layerName) {
        try {
            const item = await this.findLayerItemViewDataByName(layerName);
            const button = await item.$('.//div[contains(@id,"LayerContentViewFooter")]//button[.//span[text()="Localize"]]');
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on Localize button for layer: ${layerName}`, 'err_widget_localize_btn', err);
        }
    }

    // Gets the string 'layer611610(en)' from the layer-item  for the current selected content
    async getContentNameWithLanguage(layerName) {
        const item = await this.findLayerItemViewDataByName(layerName);
        const baseXpath = './/div[contains(@id,"LayerContentViewBody")]//div[contains(@id,"LangBasedContentSummaryViewer")]' +
                          lib.H6_DISPLAY_NAME;
        const baseEl = await item.$(baseXpath);
        await baseEl.waitForDisplayed({timeout: appConst.shortTimeout});
        const displayName = await (await item.$(baseXpath + '//span[@class="display-name"]')).getText();
        const postfix = await (await item.$(baseXpath + '//span[@class="display-name-postfix"]')).getText();
        return displayName + postfix;
    }

    async getContentStatus(layerName) {
        try {
            const item = await this.findLayerItemViewDataByName(layerName);
            const host = await this.getWidgetShadowHost();
            const el = await item.$('div[id*="LayerContentViewHeader"] div[class*="status"]');
            await el.waitForDisplayed();
            return el.getText();
        } catch (err) {
            await this.handleError(`Tried to get content status for layer: ${layerName}`, 'err_widget_content_status', err);
        }
    }

    async clickOnOpenButton(layerName) {
        try {

            const item = await this.findLayerItemViewDataByName(layerName);
            const button = await item.$('.//div[contains(@id,"LayerContentViewFooter")]//button[.//span[text()="Open"]]');
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.click();
            await this.pause(700);
        } catch (err) {
            await this.handleError(`Tried to click on Open button for layer: ${layerName}`, 'err_widget_item_open', err);
        }
    }
}

module.exports = BaseLayersWidget;
