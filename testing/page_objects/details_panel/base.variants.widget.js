/**
 * Created on 20.02.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const xpath = {
    variantsList: "//ul[contains(@class,'variants-widget-list')]",
    originalVariantsListItemView: "//li[contains(@class,'variants-widget-list') and contains(@class,'original')]",
    variantsListItemView: "//li[contains(@class,'variants-widget-list-item') and not(contains(@class,'original'))]",
    variantByName: resolution => `//div[contains(@class,'slick-row') and descendant::h6[text()='${resolution}']]//h5`,
    createVariantWidgetButton: "//button[contains(@class,'widget-button-create') and child::span[text()='Create Variant']]",
    createVariantItemButton: "//button[contains(@class,'action-button') and text()='Create Variant']",
};

class BaseVariantsWidget extends Page {

    get createVariantWidgetButton() {
        return this.variantsWidget + xpath.createVariantWidgetButton;
    }

    get createVariantButtonInOriginalItem() {
        return xpath.originalVariantsListItemView + lib.actionButton('Create Variant');
    }

    get variantListItems() {
        return this.variantsWidget + xpath.variantsListItemView;
    }

    waitForCreateVariantWidgetButtonDisplayed() {
        return this.waitForElementDisplayed(this.createVariantWidgetButton, appConst.mediumTimeout);
    }

    waitForCreateVariantWidgetButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.createVariantWidgetButton, appConst.mediumTimeout);
    }

    async clickOnCreateVariantWidgetButton() {
        await this.waitForCreateVariantWidgetButtonDisplayed();
        await this.clickOnElement(this.createVariantWidgetButton);
    }

    async countVariantsItems() {
        let items = await this.findElements(this.variantListItems);
        return items.length;
    }

    async clickOnOriginalItem() {
        let locator = this.variantsWidget + xpath.originalVariantsListItemView;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
    }

    //get all version items with the header then click on required item:
    async clickOnVariantItemByName(name) {
        try {
            await this.waitForElementDisplayed(this.variantListItems, appConst.mediumTimeout);
            //get all variants items with the name:
            let locator = lib.itemByName(name);
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            let items = await this.findElements(locator);
            //click on the item:
            await items[i].click();
            return await this.pause(300);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_expand_version"));
            throw new Error("Error when clicking on the version item: " + err);
        }
    }

    waitForWidgetLoaded() {
        return this.waitForElementDisplayed(this.variantsWidget, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot("err_load_variants_widget");
            throw new Error('Variants Widget was not loaded in ' + appConst.mediumTimeout + " " + err);
        });
    }

    async clickOnCreateVariantButtonInOriginalItem() {
        await this.waitForCreateVariantButtonInOriginalItem();
        await this.clickOnElement(this.createVariantButtonInOriginalItem);
    }

    async waitForCreateVariantButtonInOriginalItem() {
        try {
            await this.waitForElementDisplayed(this.createVariantButtonInOriginalItem, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot('create_variant_orig_button');
            throw new Error("Variants Widget - " + err);
        }
    }

}

module.exports = BaseVariantsWidget;


