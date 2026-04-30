/**
 * Created on 20.02.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const selectors = {
    variantsExtension: 'div[id*="VariantsExtension"]',
    createVariantWidgetButton: 'button[class*="variants-extension-button-create"]',
    originalListItem: 'li[class*="variants-extension-list"][class*="original"]',
    variantListItems: 'li[class*="variants-extension-list-item"]:not([class*="original"])',
};

class VariantsExtension extends Page {

    async waitForLoaded() {
        try {
            const host = await this.getWidgetShadowHost();
            const div = await host.shadow$(selectors.variantsExtension);
            await div.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('Variants Widget was not loaded', 'err_variants_widget_loaded', err);
        }
    }

    async waitForCreateVariantWidgetButtonDisplayed() {
        try {
            const host = await this.getWidgetShadowHost();
            const button = await host.shadow$(selectors.createVariantWidgetButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`'Create Variant' button should be displayed in the widget`, 'err_variant_widget', err);
        }
    }

    async waitForCreateVariantWidgetButtonNotDisplayed() {
        const host = await this.getWidgetShadowHost();
        const button = await host.shadow$(selectors.createVariantWidgetButton);
        return await button.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    async clickOnCreateVariantWidgetButton() {
        const host = await this.getWidgetShadowHost();
        const button = await host.shadow$(selectors.createVariantWidgetButton);
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await button.click();
    }

    async countVariantsItems() {
        const host = await this.getWidgetShadowHost();
        const items = await host.shadow$$(selectors.variantListItems);
        return items.length;
    }

    async clickOnOriginalItem() {
        const host = await this.getWidgetShadowHost();
        const item = await host.shadow$(selectors.originalListItem);
        await item.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await item.click();
    }

    // Click on the variant item:
    async clickOnVariantItemByName(name) {
        try {
            const host = await this.getWidgetShadowHost();
            const items = await host.shadow$$(selectors.variantListItems);
            for (const item of items) {
                const nameEl = await item.$('.//p[contains(@class,"sub-name")]');
                if (await nameEl.isExisting()) {
                    const text = await nameEl.getText();
                    if (text.includes(name)) {
                        return await item.click();
                    }
                }
            }
            throw new Error(`Variant item with name '${name}' was not found`);
        } catch (err) {
            await this.handleError(`Error when clicking on the version item with name '${name}'`, 'err_click_variant_item', err);
        }
    }

    async clickOnDuplicateButton(name) {
        const host = await this.getWidgetShadowHost();
        const items = await host.shadow$$(selectors.variantListItems);
        for (const item of items) {
            //const nameEl = await item.$('p.xp-admin-common-sub-name');
            const nameEl = await item.$(`.//p[contains(@class,'xp-admin-common-sub-name')]`);
            if (await nameEl.isExisting()) {
                const text = await nameEl.getText();
                if (text.includes(name)) {
                    const button = await item.$(`.//button[contains(@id,'ActionButton') and .//span[contains(.,'Duplicate')]]`);
                    await button.waitForDisplayed({timeout: appConst.mediumTimeout});
                    return await button.click();
                }
            }
        }
        throw new Error(`Variant item with name '${name}' was not found`);
    }

    async waitForCreateVariantButtonInOriginalItem() {
        try {
            const host = await this.getWidgetShadowHost();
            const item = await host.shadow$(selectors.originalListItem);
            const button = await item.$('.//button[contains(@id,"ActionButton") and .//span[contains(.,"Create Variant")]]');
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`'Create Variant' button should be displayed in the Original item`, 'create_variant_orig_button', err);
        }
    }

    async clickOnCreateVariantButtonInOriginalItem() {
        const host = await this.getWidgetShadowHost();
        const item = await host.shadow$(selectors.originalListItem);
        const button = await item.$('.//button[contains(@id,"ActionButton") and .//span[contains(.,"Create Variant")]]');
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await button.click();
    }
}

module.exports = VariantsExtension;
