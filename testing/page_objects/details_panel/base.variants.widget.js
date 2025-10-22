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

    get variantDuplicateButton() {
        return "//div[contains(@id,'VariantsListItemViewMenuButton')]" + lib.actionButton('Duplicate');
    }

    get variantListItems() {
        return this.variantsWidget + xpath.variantsListItemView;
    }

    async waitForCreateVariantWidgetButtonDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.createVariantWidgetButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`'Create Variant' button should be displayed in the widget`,'err_variant_widget', err);
        }
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

    // Click on the variant item:
    async clickOnVariantItemByName(name) {
        try {
            await this.waitForElementDisplayed(this.variantListItems, appConst.mediumTimeout);
            let locator = xpath.variantsListItemView + lib.itemByName(name);
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.clickOnElement(locator);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_expand_version"));
            throw new Error("Error when clicking on the version item: " + err);
        }
    }

    async clickOnDuplicateButton() {
        await this.waitForElementDisplayed(this.variantDuplicateButton, appConst.mediumTimeout);
        await this.clickOnElement(this.variantDuplicateButton);
        return await this.pause(300);
    }

    async waitForWidgetLoaded() {
        try {
            await this.waitForElementDisplayed(this.variantsWidget, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Variants Widget should be loaded', 'err_load_variants_widget', err);
        }
    }

    async clickOnCreateVariantButtonInOriginalItem() {
        await this.waitForCreateVariantButtonInOriginalItem();
        await this.clickOnElement(this.createVariantButtonInOriginalItem);
    }

    async waitForCreateVariantButtonInOriginalItem() {
        try {
            await this.waitForElementDisplayed(this.createVariantButtonInOriginalItem, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`'Create Variant' button should be displayed in the Original item`, 'create_variant_orig_button', err);
        }
    }
}

module.exports = BaseVariantsWidget;


