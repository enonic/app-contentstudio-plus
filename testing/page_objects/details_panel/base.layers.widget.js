/**
 * Created on 09/09/2020.
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const LayersContentTreeDialog = require('../project/layers.content.tree.dialog');

const LAYERS_WIDGET = 'div[data-component="LayersWidget"]';

const selectors = {
    layersWidget: LAYERS_WIDGET,
    // Every layer card is a fieldset wrapped in a row div, the rows are in the cards container
    layerCards: `${LAYERS_WIDGET} > div > div > fieldset`,
    // 'Show all' is the only button that is not nested in a card
    showAllButton: `${LAYERS_WIDGET} > div > button`,
    // The selectors below are relative to a layer card.
    // The header row is the only row with 'justify-between', it holds the layer label and the content status
    layerLabel: 'div.justify-between > span:first-child',
    contentStatus: 'div.justify-between > span:nth-child(2)',
    contentDisplayName: 'div.truncate.text-base.font-semibold',
    contentPath: 'div.truncate.text-sm.text-subtle',
    // The localisation state is an indicator, its aria-label is 'Localised' or 'Not localised'
    localisationIndicator: 'span[data-component="Tooltip"]',
    // The card has a single action button, it is rendered only in the expanded card
    actionButton: 'button[data-component="Button"]',
    currentLayerLegend: 'legend',
    actionButtonByLabel: label => `button[aria-label="${label}"]`,
};

// The expanded card is the only card with a shadow
const EXPANDED_CLASS = 'shadow-md';

// The same icon is rendered in both states, only the aria-label and the opacity differ
const LOCALISATION_LABEL = {
    LOCALISED: 'Localised',
    NOT_LOCALISED: 'Not localised',
};

// The layer label holds the language as well: 'layer274425 (no)' -> {name: 'layer274425', language: '(no)'}
const parseLayerLabel = label => {
    const text = label.trim();
    const match = /^(.*)\s(\(.+\))$/.exec(text);
    return match ? {name: match[1], language: match[2]} : {name: text, language: ''};
};

class BaseLayersWidget extends Page {

    // Returns the cards as they are, an empty array means the widget has no layers to show
    async findLayerCards() {
        const host = await this.getShadowHost();
        return await host.shadow$$(selectors.layerCards);
    }

    // The cards are rendered only after the layers data is loaded, so the query is retried
    async getLayerCards() {
        let cards = [];
        try {
            await this.getBrowser().waitUntil(async () => {
                try {
                    cards = await this.findLayerCards();
                } catch {
                    // the widget is not in the DOM yet
                    return false;
                }
                return cards.length > 0;
            }, {
                timeout: appConst.mediumTimeout,
                timeoutMsg: 'Layer cards were not rendered in the Layers Widget',
            });
        } catch (err) {
            await this.handleError('Layers Widget, get the layer cards', 'err_widget_layer_cards', err);
        }
        return cards;
    }

    async waitForWidgetLoaded() {
        try {
            const host = await this.getShadowHost();
            const widget = await host.shadow$(selectors.layersWidget);
            await widget.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('Layers Widget was not loaded', 'err_layer_widget_loaded', err);
        }
    }

    async isWidgetVisible() {
        const host = await this.getShadowHost();
        const widget = await host.shadow$(selectors.layersWidget);
        return await widget.isDisplayed();
    }

    // 'Show all' is displayed only when the widget shows fewer layers than the content has
    async waitForShowAllButtonDisplayed() {
        try {
            const host = await this.getShadowHost();
            const button = await host.shadow$(selectors.showAllButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`'Show all' button should be displayed in the widget`, 'err_widget_show_all_btn', err);
        }
    }

    async clickOnShowAllButton() {
        try {
            const layersContentTreeDialog = new LayersContentTreeDialog();
            const host = await this.getShadowHost();
            const button = await host.shadow$(selectors.showAllButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            await button.click();
            await layersContentTreeDialog.waitForDialogLoaded();
            return layersContentTreeDialog;
        } catch (err) {
            await this.handleError(`Tried to click on 'Show all' button`, 'err_widget_show_all_btn', err);
        }
    }

    // The layer label also contains the language, so only the name part is compared
    async getLayerCardByName(layerName) {
        const cards = await this.getLayerCards();
        for (const card of cards) {
            const labelElement = await card.$(selectors.layerLabel);
            if (await labelElement.isExisting()) {
                const label = await labelElement.getText();
                if (parseLayerLabel(label).name === layerName) {
                    return card;
                }
            }
        }
        throw new Error(`Layer card with the name '${layerName}' was not found`);
    }

    async clickOnWidgetItem(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            await card.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await card.click();
        } catch (err) {
            await this.handleError(`Tried to click on the widget item for the layer '${layerName}'`, 'err_widget_item', err);
        }
    }

    async waitForLayerItemExpanded(layerName) {
        const card = await this.getLayerCardByName(layerName);
        await card.waitForDisplayed({timeout: appConst.mediumTimeout});
        const attrClass = await card.getAttribute('class');
        return attrClass.includes(EXPANDED_CLASS);
    }

    async isCurrentLayer(layerName) {
        const card = await this.getLayerCardByName(layerName);
        const legend = await card.$(selectors.currentLayerLegend);
        return await legend.isExisting();
    }

    async getLayersName() {
        try {
            const cards = await this.getLayerCards();
            const names = [];
            for (const card of cards) {
                const label = await (await card.$(selectors.layerLabel)).getText();
                names.push(parseLayerLabel(label).name);
            }
            return names;
        } catch (err) {
            await this.handleError('Tried to get the layers names', 'err_widget_layers_names', err);
        }
    }

    // Returns the language in parentheses, e.g. '(no)', or an empty string when the layer has no language
    async getLayerLanguage(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            const label = await (await card.$(selectors.layerLabel)).getText();
            return parseLayerLabel(label).language;
        } catch (err) {
            await this.handleError(`Tried to get the language for the layer '${layerName}'`, 'err_widget_layer_language', err);
        }
    }

    // The status is not displayed when the content does not exist in the layer
    async getContentStatus(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            const status = await card.$(selectors.contentStatus);
            await status.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await status.getText();
        } catch (err) {
            await this.handleError(`Tried to get the content status for the layer '${layerName}'`, 'err_widget_content_status', err);
        }
    }

    async getContentDisplayName(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            const displayName = await card.$(selectors.contentDisplayName);
            await displayName.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await displayName.getText();
        } catch (err) {
            await this.handleError(`Tried to get the content display name for the layer '${layerName}'`, 'err_widget_content_name', err);
        }
    }

    async getContentPath(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            const path = await card.$(selectors.contentPath);
            await path.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await path.getText();
        } catch (err) {
            await this.handleError(`Tried to get the content path for the layer '${layerName}'`, 'err_widget_content_path', err);
        }
    }

    // Returns 'Localised' or 'Not localised'. The root layer has no indicator, so the call fails for it
    async getLocalisationState(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            const indicator = await card.$(selectors.localisationIndicator);
            await indicator.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await indicator.getAttribute('aria-label');
        } catch (err) {
            await this.handleError(`Tried to get the localisation state for the layer '${layerName}'`, 'err_widget_localisation', err);
        }
    }

    // Both states render the same icon, so the state is taken from its aria-label
    async isContentLocalised(layerName) {
        const state = await this.getLocalisationState(layerName);
        if (state === LOCALISATION_LABEL.LOCALISED) {
            return true;
        }
        if (state === LOCALISATION_LABEL.NOT_LOCALISED) {
            return false;
        }
        throw new Error(`Unexpected localisation state '${state}' in the layer '${layerName}'`);
    }

    // The label is 'Edit' in the current layer and 'Open' in the other layers
    async getActionButtonLabel(layerName) {
        try {
            const card = await this.getLayerCardByName(layerName);
            const button = await card.$(selectors.actionButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await button.getAttribute('aria-label');
        } catch (err) {
            await this.handleError(`Tried to get the action button label for the layer '${layerName}'`, 'err_widget_action_btn', err);
        }
    }

    // The action button is rendered only in the expanded card, so the card has to be clicked beforehand
    async getActionButtonByLabel(layerName, label) {
        const card = await this.getLayerCardByName(layerName);
        const button = await card.$(selectors.actionButtonByLabel(label));
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return button;
    }

    async waitForEditButtonEnabled(layerName) {
        try {
            const button = await this.getActionButtonByLabel(layerName, 'Edit');
            return await button.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`Layers Widget - 'Edit' button should be enabled, layer: ${layerName}`, 'err_widget_edit_btn', err);
        }
    }

    async waitForOpenButtonEnabled(layerName) {
        try {
            const button = await this.getActionButtonByLabel(layerName, 'Open');
            return await button.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`Layers Widget - 'Open' button should be enabled, layer: ${layerName}`, 'err_widget_open_btn', err);
        }
    }

    async clickOnEditButton(layerName) {
        try {
            const button = await this.getActionButtonByLabel(layerName, 'Edit');
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on 'Edit' button for the layer '${layerName}'`, 'err_widget_item_edit', err);
        }
    }

    async clickOnOpenButton(layerName) {
        try {
            const button = await this.getActionButtonByLabel(layerName, 'Open');
            return await button.click();
        } catch (err) {
            await this.handleError(`Tried to click on 'Open' button for the layer '${layerName}'`, 'err_widget_item_open', err);
        }
    }
}

module.exports = BaseLayersWidget;
