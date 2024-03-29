/**
 * Created on 04/07/2018.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

class BaseDetailsPanel extends Page {

    //drop down menu for switch to Details, Version History, Dependencies
    async clickOnWidgetSelectorDropdownHandle() {
        try {
            await this.waitForWidgetSelectorDropDownHandleDisplayed();
            await this.pause(300);
            return await this.clickOnElement(this.widgetSelectorDropdownHandle);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_widget_dropdown'));
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

    async getOptionsName() {
        let locator = this.widgetSelectorDropdown + lib.DIV_GRID + "//div[contains(@id,'WidgetViewer')]" + lib.H6_DISPLAY_NAME;
        return await this.getTextInElements(locator);
    }

    //clicks on dropdown handle and select the 'Version History' menu item
    async openVersionHistory() {
        try {
            await this.clickOnWidgetSelectorDropdownHandle();
            let versionHistoryOption = this.widgetSelectorDropdown + lib.itemByDisplayName(appConst.WIDGET_TITLE.VERSION_HISTORY);
            await this.waitForElementDisplayed(versionHistoryOption, appConst.mediumTimeout);
            let elements = await this.getDisplayedElements(versionHistoryOption);
            await elements[0].click();
            return await this.pause(200);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_open_versions'));
            throw new Error("Error when opening Version History widget: " + err);
        }
    }

    async openPublishReport() {
        try {
            await this.clickOnWidgetSelectorDropdownHandle();
            let publishingReportOption = this.widgetSelectorDropdown + lib.itemByDisplayName(appConst.WIDGET_TITLE.PUBLISHING_REPORT);
            await this.waitForElementDisplayed(publishingReportOption, appConst.mediumTimeout);
            let elements = await this.getDisplayedElements(publishingReportOption);
            await elements[0].click();
            return await this.pause(200);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_open_publish_report'));
            throw new Error("Error when opening Publishing report widget: " + err);
        }
    }


    getWidgetSelectorDropdownOptions() {
        let locator = this.widgetSelectorDropdown + lib.H6_DISPLAY_NAME;
        return this.getTextInDisplayedElements(locator);
    }

    //clicks on dropdown handle and select the 'Dependencies' menu item
    async openDependencies() {
        await this.clickOnWidgetSelectorDropdownHandle();
        let dependenciesOption = this.widgetSelectorDropdown + lib.itemByDisplayName(appConst.WIDGET_TITLE.DEPENDENCIES);
        await this.waitForElementDisplayed(dependenciesOption, appConst.mediumTimeout);
        let result = await this.getDisplayedElements(dependenciesOption);
        return await this.getBrowser().elementClick(result[0].elementId);
    }

    async openLayers() {
        try {
            await this.clickOnWidgetSelectorDropdownHandle();
            let layersOption = this.widgetSelectorDropdown + lib.itemByDisplayName(appConst.WIDGET_TITLE.LAYERS);
            await this.waitForElementDisplayed(layersOption, appConst.mediumTimeout);
            let result = await this.getDisplayedElements(layersOption);
            await result[0].click();
            return await this.pause(500);
        } catch (err) {
            throw new Error("Error when opening Layers widget" + err);
        }
    }

    async openVariants() {
        try {
            await this.clickOnWidgetSelectorDropdownHandle();
            let variantsOption = this.widgetSelectorDropdown + lib.itemByDisplayName(appConst.WIDGET_TITLE.VARIANTS);
            await this.waitForElementDisplayed(variantsOption, appConst.mediumTimeout);
            let result = await this.getDisplayedElements(variantsOption);
            await result[0].click();
            return await this.pause(500);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_variants_widget');
            await this.saveScreenshot(screenshot);
            throw new Error(`Error during opening Variants widget, screenshot:${screenshot} ` + err);
        }
    }

    async openEmulatorWidget() {
        try {
            await this.clickOnWidgetSelectorDropdownHandle();
            let emulatorOptionLocator = this.widgetSelectorDropdown + lib.itemByDisplayName(appConst.WIDGET_TITLE.EMULATOR);
            await this.waitForElementDisplayed(emulatorOptionLocator, appConst.mediumTimeout);
            let result = await this.getDisplayedElements(emulatorOptionLocator);
            await result[0].click();
            return await this.pause(500);
        } catch (err) {
            throw new Error("Error when opening Emulator widget" + err);
        }
    }
}

module.exports = BaseDetailsPanel;


