/**
 * Created on 04/07/2018.
 */
const Page = require('../page');
const {COMMON} = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const WidgetSelectorDropdown = require('../components/selectors/widget.selector.dropdown')

const xpath = {
    scheduleWidgetItem: "//div[contains(@id,'ExtensionOnlinePropertiesItemView')]",
};

class BaseContextWindowPanel extends Page {

    async waitForScheduleWidgetItemNotDisplayed() {
        return this.waitForElementNotDisplayed(xpath.scheduleWidgetItem, appConst.mediumTimeout);
    }

    async waitForScheduleWidgetItemDisplayed() {
        return this.waitForElementDisplayed(xpath.scheduleWidgetItem, appConst.mediumTimeout);
    }

    async getSelectedOptionInWidgetSelectorDropdown() {
        try {
            let selector = this.container + COMMON.CONTEXT_WINDOW_WIDGET_SELECTOR_SEARCH_INPUT;
            await this.waitForElementDisplayed(selector);
            return await this.getTextInInput(selector);
        }catch (err){
            await this.handleError('Cannot get selected option in widget selector dropdown', 'err_get_selected_option_widget_selector', err);
        }
    }
    //drop down menu for switching to Components, Details, Version History, Dependencies
    async clickOnWidgetSelectorDropdownHandle() {
        try {
            await this.waitForWidgetSelectorDropDownHandleDisplayed();
            await this.pause(300);
            await this.clickOnElement(this.widgetSelectorDropdownHandle);
            await this.pause(700);
        } catch (err) {
            await this.handleError('Tried to click on Widget Selector dropdown handle.', 'err_widget_selector_dropdown_handle', err);
        }
    }

    async waitForWidgetSelectorDropDownHandleDisplayed() {
        try {
            await this.waitForElementDisplayed(this.widgetSelectorDropdownHandle, appConst.mediumTimeout);
        } catch (err) {
            await this.refresh();
            await this.pause(2000);
            await this.waitForElementDisplayed(this.widgetSelectorDropdownHandle, appConst.shortTimeout);
        }
    }

    //clicks on dropdown handle and select the 'Version History' menu item
    async openVersionHistory() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_SELECTOR_OPTIONS.VERSION_HISTORY);
            await this.pause(900);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_versions');
            throw new Error(`Error occurred in widget selector dropdown, Version History, screenshot ${screenshot}: ` + err);
        }
    }
    async openPublishReportWidget() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.typeTextInSearchInput(appConst.WIDGET_SELECTOR_OPTIONS.PUBLISHING_REPORT)
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_SELECTOR_OPTIONS.PUBLISHING_REPORT);
            await this.pause(900);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_versions');
            throw new Error(`Error occurred in widget selector dropdown, Version History, screenshot ${screenshot}: ` + err);
        }
    }


    async selectItemInWidgetSelector(itemName) {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        await this.clickOnWidgetSelectorDropdownHandle();
        await widgetSelectorDropdown.clickOnOptionByDisplayName(itemName);
    }

    async getWidgetSelectorDropdownOptions() {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        return await widgetSelectorDropdown.getOptionsName();
    }

    //clicks on dropdown handle and select the 'Dependencies' menu item
    async openDependencies() {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        await this.clickOnWidgetSelectorDropdownHandle();
        await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_SELECTOR_OPTIONS.DEPENDENCIES);
    }

    async openLayers() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_SELECTOR_OPTIONS.LAYERS);
        } catch (err) {
            await this.handleError('Tried to open Layers widget', 'err_open_layers_widget', err);
        }
    }

    async openDetailsWidget() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_SELECTOR_OPTIONS.DETAILS);
        } catch (err) {
            await this.handleError('Tried to open Details widget', 'err_open_details_widget', err);
        }
    }

    async clickOnEmulatorOptionsItem() {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_SELECTOR_OPTIONS.EMULATOR);
    }

    async openVariants() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.VARIANTS);
        } catch (err) {
            await this.handleError('Tried to open Variants Widget','err_variants', err);
        }
    }


    async getSelectedOptionsDisplayName() {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        return await widgetSelectorDropdown.getSelectedOption();
    }

    getPanelWidth(width) {
        let value = width.substring(0, width.indexOf('px'));
        const parsed = Number(value);
        if (isNaN(parsed)) {
            return false;
        }
        return parsed;
    }

    async waitForWidgetDropdownRoleAttribute(expectedValue) {
        let locator = this.widgetSelectorDropdownHandle;
        await this.waitForAttributeValue(locator, appConst.ACCESSIBILITY_ATTRIBUTES.ROLE, expectedValue);
    }

    async isOpened() {
        let width = await this.getWindowWidth();
        return width > 1920;
    }
}

module.exports = BaseContextWindowPanel;
