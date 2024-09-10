/**
 * Created on 04/07/2018.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const WidgetSelectorDropdown = require('../components/selectors/widget.selector.dropdown')

const xpath = {
    scheduleWidgetItem: "//div[contains(@id,'OnlinePropertiesWidgetItemView')]",
};

class BaseDetailsPanel extends Page {

    async waitForScheduleWidgetItemNotDisplayed() {
        return this.waitForElementNotDisplayed(xpath.scheduleWidgetItem, appConst.mediumTimeout);
    }

    async waitForScheduleWidgetItemDisplayed() {
        return this.waitForElementDisplayed(xpath.scheduleWidgetItem, appConst.mediumTimeout);
    }

    async getSelectedOptionInWidgetSelectorDropdown() {
        let selector = this.widgetSelectorDropdown + "//div[@class='selected-option']//h6";
        return await this.getText(selector);
    }

    //drop down menu for switching to Components, Details, Version History, Dependencies
    async clickOnWidgetSelectorDropdownHandle() {
        try {
            await this.waitForWidgetSelectorDropDownHandleDisplayed();
            await this.pause(300);
            await this.clickOnElement(this.widgetSelectorDropdownHandle);
            await this.pause(700);
        } catch (err) {
            await this.saveScreenshotUniqueName('err_widget_dropdown');
            throw new Error('Error when clicking on Widget Selector dropdown handle  ' + err);
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
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.VERSION_HISTORY, this.container);
            await widgetSelectorDropdown.clickOnApplySelectionButton();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_versions');
            throw new Error(`Error occurred in widget selector dropdown, Version History, screenshot ${screenshot}: ` + err);
        }
    }

    async filterAndOpenVersionHistory() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await widgetSelectorDropdown.selectFilteredWidgetItemAndClickOnOk(appConst.WIDGET_TITLE.VERSION_HISTORY);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_versions');
            throw new Error(`Error occurred in widget selector dropdown, Version History, screenshot ${screenshot}: ` + err);
        }
    }

    async selectItemInWidgetSelector(itemName) {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        await this.clickOnWidgetSelectorDropdownHandle();
        await widgetSelectorDropdown.clickOnOptionByDisplayName(itemName);
        await widgetSelectorDropdown.clickOnApplySelectionButton();
    }

    getWidgetSelectorDropdownOptions() {
        let locator = this.widgetSelectorDropdown + lib.DROPDOWN_SELECTOR.DROPDOWN_LIST_ITEM + lib.H6_DISPLAY_NAME;
        return this.getTextInDisplayedElements(locator);
    }

    //clicks on dropdown handle and select the 'Dependencies' menu item
    async openDependencies() {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        await this.clickOnWidgetSelectorDropdownHandle();
        await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.DEPENDENCIES);
        await widgetSelectorDropdown.clickOnApplySelectionButton();
    }

    async openLayers() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.LAYERS);
            await widgetSelectorDropdown.clickOnApplySelectionButton();
        } catch (err) {
            throw new Error("Error during opening 'Layers widget'" + err);
        }
    }

    async openDetailsWidget() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.DETAILS);
            await widgetSelectorDropdown.clickOnApplySelectionButton();
        } catch (err) {
            throw new Error("Error occurred during opening 'Details widget'" + err);
        }
    }

    async clickOnEmulatorOptionsItem() {
        let widgetSelectorDropdown = new WidgetSelectorDropdown();
        await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.EMULATOR);
        await widgetSelectorDropdown.clickOnApplySelectionButton();
    }

    async openEmulatorWidget() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await this.clickOnEmulatorOptionsItem();
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_widget_selector'));
            await this.refresh();
            await this.pause(3000);
            await this.clickOnWidgetSelectorDropdownHandle();
            await this.clickOnEmulatorOptionsItem();
        }
    }
    async openVariants() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.VARIANTS);
            await widgetSelectorDropdown.clickOnApplySelectionButton();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_variants_widget');
            throw new Error(`Error during opening Variants widget, screenshot:${screenshot} ` + err);
        }
    }

    async openPublishReport() {
        try {
            let widgetSelectorDropdown = new WidgetSelectorDropdown();
            await this.clickOnWidgetSelectorDropdownHandle();
            await widgetSelectorDropdown.clickOnOptionByDisplayName(appConst.WIDGET_TITLE.PUBLISHING_REPORT);
            await widgetSelectorDropdown.clickOnApplySelectionButton();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_publish_report');
            throw new Error("Error when opening Publishing report widget: " + err);
        }
    }
}

module.exports = BaseDetailsPanel;
