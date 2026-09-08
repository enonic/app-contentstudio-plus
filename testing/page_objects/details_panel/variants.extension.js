/**
 * Created on 20.02.2023  updated on 31.08.2026
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const VARIANTS_WIDGET = 'div[data-component="VariantsWidget"]';

const selectors = {
    variantsWidget: VARIANTS_WIDGET,
    // The widget level 'Create Variant' button is a direct child of the widget,
    // it is displayed instead of the cards when the original content has no variants
    createVariantWidgetButton: `${VARIANTS_WIDGET} > button[aria-label="Create Variant"]`,
    // The Original card is the only fieldset that is a direct child of a section,
    // the variant cards are wrapped in one more div
    originalCard: `${VARIANTS_WIDGET} > div > fieldset`,
    variantCards: `${VARIANTS_WIDGET} > div > div > fieldset`,
    cardDisplayName: 'div.truncate.text-base.font-semibold',
    cardPath: 'div.truncate.text-sm.text-subtle',
    // The card buttons are rendered only in the expanded card
    editButton: 'button[aria-label="Edit"]',
    createVariantButton: 'button[aria-label="Create Variant"]',
    duplicateButton: 'button[aria-label="Duplicate"]',
};

class VariantsExtension extends Page {

    async waitForLoaded() {
        try {
            const host = await this.getShadowHost();
            const widget = await host.shadow$(selectors.variantsWidget);
            await widget.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('Variants Widget was not loaded', 'err_variants_widget_loaded', err);
        }
    }

    async waitForCreateVariantWidgetButtonDisplayed() {
        try {
            const host = await this.getShadowHost();
            const button = await host.shadow$(selectors.createVariantWidgetButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`'Create Variant' button should be displayed in the widget`, 'err_variant_widget', err);
        }
    }

    async waitForCreateVariantWidgetButtonNotDisplayed() {
        const host = await this.getShadowHost();
        const button = await host.shadow$(selectors.createVariantWidgetButton);
        return await button.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    // The widget renders a loading placeholder first, so wait until it settles into one of the two shapes:
    // the widget level 'Create Variant' button when the original has no variants, or the Original card when it has
    async isVariantsListEmpty() {
        const host = await this.getShadowHost();
        let isEmpty = false;
        await this.getBrowser().waitUntil(async () => {
            try {
                const widgetLevelButton = await host.shadow$(selectors.createVariantWidgetButton);
                if (await widgetLevelButton.isDisplayed()) {
                    isEmpty = true;
                    return true;
                }
                const originalCard = await host.shadow$(selectors.originalCard);
                return await originalCard.isDisplayed();
            } catch {
                // the widget is not rendered yet
                return false;
            }
        }, {
            timeout: appConst.mediumTimeout,
            timeoutMsg: `Neither the widget level 'Create Variant' button nor the Original card was displayed in the widget`,
        });
        return isEmpty;
    }

    // 'Create Variant' is rendered either as the only content of the widget, when the original has no variants yet,
    // or as a button in the expanded Original card
    async clickOnCreateVariantWidgetButton() {
        try {
            if (await this.isVariantsListEmpty()) {
                const host = await this.getShadowHost();
                const button = await host.shadow$(selectors.createVariantWidgetButton);
                return await button.click();
            }
            return await this.clickOnCreateVariantButtonInOriginalItem();
        } catch (err) {
            await this.handleError(`Tried to click on 'Create Variant' button in the widget`, 'err_click_create_variant_widget', err);
        }
    }

    async countVariantsItems() {
        const host = await this.getShadowHost();
        const cards = await host.shadow$$(selectors.variantCards);
        return cards.length;
    }

    async clickOnOriginalItem() {
        try {
            const host = await this.getShadowHost();
            const card = await host.shadow$(selectors.originalCard);
            await card.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await card.click();
        } catch (err) {
            await this.handleError('Tried to click on the Original card', 'err_click_original_card', err);
        }
    }

    // A variant has the same display name as its original, so the variant is identified by its path
    async getVariantCardByName(name) {
        const host = await this.getShadowHost();
        const cards = await host.shadow$$(selectors.variantCards);
        for (const card of cards) {
            const pathElement = await card.$(selectors.cardPath);
            if (await pathElement.isExisting()) {
                const path = await pathElement.getText();
                if (path.includes(name)) {
                    return card;
                }
            }
        }
        throw new Error(`Variant card with the name '${name}' was not found`);
    }

    // The buttons are rendered only in the expanded card, so the card is expanded on demand
    async expandCardIfCollapsed(card) {
        const editButton = await card.$(selectors.editButton);
        if (await editButton.isDisplayed()) {
            return;
        }
        await card.click();
        await editButton.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async clickOnVariantItemByName(name) {
        try {
            const card = await this.getVariantCardByName(name);
            await card.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await card.click();
        } catch (err) {
            await this.handleError(`Tried to click on the variant card '${name}'`, 'err_click_variant_card', err);
        }
    }

    async getVariantDisplayNameByName(name) {
        try {
            const card = await this.getVariantCardByName(name);
            const displayNameElement = await card.$(selectors.cardDisplayName);
            await displayNameElement.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await displayNameElement.getText();
        } catch (err) {
            await this.handleError(`Tried to get the display name in the variant card '${name}'`, 'err_variant_display_name', err);
        }
    }

    async clickOnDuplicateButton(name) {
        try {
            const card = await this.getVariantCardByName(name);
            await card.waitForDisplayed({timeout: appConst.mediumTimeout});
            await this.expandCardIfCollapsed(card);
            const button = await card.$(selectors.duplicateButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on 'Duplicate' button in the variant card '${name}'`,
                'err_click_duplicate_variant', err);
        }
    }

    async waitForCreateVariantButtonInOriginalItem() {
        try {
            const host = await this.getShadowHost();
            const button = await host.shadow$(`${selectors.originalCard} ${selectors.createVariantButton}`);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`'Create Variant' button should be displayed in the Original card`,
                'err_create_variant_original_card', err);
        }
    }

    async clickOnCreateVariantButtonInOriginalItem() {
        try {
            const host = await this.getShadowHost();
            const card = await host.shadow$(selectors.originalCard);
            await card.waitForDisplayed({timeout: appConst.mediumTimeout});
            await this.expandCardIfCollapsed(card);
            const button = await card.$(selectors.createVariantButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on 'Create Variant' button in the Original card`,
                'err_click_create_variant_original_card', err);
        }
    }
}

module.exports = VariantsExtension;
