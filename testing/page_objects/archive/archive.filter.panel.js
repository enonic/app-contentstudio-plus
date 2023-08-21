/**
 * Created on 15.05.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');
const XPATH = {
    container: "//div[contains(@id,'ArchiveFilterPanel')]",
    selectorOptionItemByLabel: label => `//ul[contains(@id,'BucketListBox')]//div[contains(@class,'item-view-wrapper') and descendant::h6[contains(@class,'main-name') and contains(.,'${label}')]]`,
    aggregationLabelByName: name => `//div[contains(@class,'checkbox') and child::label[contains(.,'${name}')]]//label`,
    folderAggregation: () => `//div[contains(@class,'checkbox') and child::label[contains(.,'Folder') and not(contains(.,'Template'))]]//label`,
    aggregationCheckboxByName: name => `//div[contains(@class,'checkbox') and child::label[contains(.,'${name}')]]` + lib.CHECKBOX_INPUT,
    lastModifiedAggregationEntry:
        time => `//div[@class='aggregation-group-view']/h2[text()='Last Modified']/..//div[contains(@class,'checkbox') and child::label]//label[contains(.,'${time}')]`,
};

class ArchiveFilterPanel extends Page {

    get clearFilterLink() {
        return XPATH.container + lib.FILTER_PANEL.clearFilterLink;
    }

    get showResultsButton() {
        return XPATH.container + lib.FILTER_PANEL.showResultsButton;
    }

    get showMoreTypesButton() {
        return XPATH.container + lib.FILTER_PANEL.aggregationGroupDiv('Content Types') + lib.FILTER_PANEL.showMoreButton;
    }

    get showLessTypesButton() {
        return XPATH.container + lib.FILTER_PANEL.aggregationGroupDiv('Content Types') + lib.FILTER_PANEL.showLessButton;
    }

    get ownerDropdownHandle() {
        return XPATH.container + lib.FILTER_PANEL.aggregationDropdown('Owner') + lib.DROP_DOWN_HANDLE;
    }

    get lastModifiedByDropdownHandle() {
        return XPATH.container + lib.FILTER_PANEL.aggregationDropdown('Last Modified By') + lib.DROP_DOWN_HANDLE;
    }

    get closeDependenciesSectionButtonLocator() {
        return XPATH.container + lib.FILTER_PANEL.dependenciesSection + "//button[contains(@class,'btn-close')]";
    }

    get searchTextInput() {
        return XPATH.container + lib.FILTER_PANEL.searchInput;
    }

    waitForLastModifiedByDropdownHandleDisplayed() {
        return this.waitForElementDisplayed(this.lastModifiedByDropdownHandle, appConst.mediumTimeout);
    }

    waitForOwnerDropdownHandleDisplayed() {
        return this.waitForElementDisplayed(this.ownerDropdownHandle, appConst.mediumTimeout);
    }

    async clickOnOwnerDropdownHandle() {
        await this.waitForOwnerDropdownHandleDisplayed();
        await this.clickOnElement(this.ownerDropdownHandle);
        await this.pause(500);
    }

    async clickOnLastModifiedByDropdownHandle() {
        await this.waitForLastModifiedByDropdownHandleDisplayed();
        return await this.clickOnElement(this.lastModifiedByDropdownHandle);
    }

    async typeSearchText(text) {
        try {
            await this.typeTextInInput(this.searchTextInput, text);
            return await this.pause(500);
        } catch (err) {
            throw new Error("Filter Panel, Error when type text in Search Input " + err);
        }
    }

    waitForOpened() {
        return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
    }

    waitForShowResultsButtonDisplayed() {
        return this.waitForElementDisplayed(this.showResultsButton, appConst.mediumTimeout);
    }

    waitForShowMoreButtonDisplayed() {
        return this.waitForElementDisplayed(this.showMoreTypesButton, appConst.shortTimeout);
    }

    waitForShowMoreButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.showMoreTypesButton, appConst.shortTimeout);
    }

    async clickOnShowMoreButton() {
        await this.waitForShowMoreButtonDisplayed();
        return await this.clickOnElement(this.showMoreTypesButton);
    }

    isShowMoreButtonDisplayed() {
        return this.isElementDisplayed(this.showMoreTypesButton);
    }

    waitForShowLessButtonDisplayed() {
        return this.waitForElementDisplayed(this.showLessTypesButton, appConst.shortTimeout);
    }

    waitForShowLessButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.showLessTypesButton, appConst.shortTimeout);
    }

    async clickOnShowResultsButton() {
        await this.waitForShowResultsButtonDisplayed();
        return await this.clickOnElement(this.showResultsButton);
    }

    waitForCloseDependenciesSectionButtonDisplayed() {
        return this.waitForElementDisplayed(this.closeDependenciesSectionButtonLocator, appConst.mediumTimeout);
    }

    isPanelVisible() {
        return this.isElementDisplayed(XPATH.container);
    }

    waitForClearLinkDisplayed() {
        return this.waitForElementDisplayed(this.clearFilterLink, appConst.mediumTimeout)
    }

    waitForClearLinkNotDisplayed() {
        return this.waitForElementNotDisplayed(this.clearFilterLink, appConst.mediumTimeout)
    }

    async waitForDependenciesSectionVisible(ms) {
        try {
            let timeout;
            timeout = ms === undefined ? appConst.mediumTimeout : ms;
            return await this.waitForElementDisplayed(XPATH.container + lib.FILTER_PANEL.dependenciesSection, timeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_load_dependencies_section');
            throw new Error("Filter Panel: Dependencies section should be visible! screenshot: " + screenshot + ' ' + err);
        }
    }

    async clickOnClearButton() {
        await this.waitForClearLinkDisplayed();
        await this.clickOnElement(this.clearFilterLink)
        await this.pause(1000);
    }

    // clicks on a checkbox in Content Types aggregation block
    async clickOnCheckboxInContentTypesBlock(contentType) {
        try {
            let selector = lib.FILTER_PANEL.aggregationGroupDiv('Content Types') + XPATH.aggregationLabelByName(contentType);
            await this.pause(500);
            let result = await this.getDisplayedElements(this.showMoreTypesButton);
            if (result.length > 0) {
                await this.clickOnShowMoreButton();
            }
            await this.waitForElementDisplayed(selector, appConst.shortTimeout);
            await this.clickOnElement(selector);
            return await this.pause(1200);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName(filter_panel);
            throw new Error('Filter Panel ,error after clicking on a checkbox in aggregation block, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async waitForCheckboxDisplayed(blockName, label) {
        let selector = lib.FILTER_PANEL.aggregationGroupDiv(blockName) + XPATH.aggregationLabelByName(label);
        return await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
    }

    async clickOnAggregationCheckbox(blockName, label) {
        let locator = lib.FILTER_PANEL.aggregationGroupDiv(blockName) + XPATH.aggregationLabelByName(label);
        await this.waitForCheckboxDisplayed(blockName, label);
        await this.clickOnElement(locator);
        await this.pause(500);
    }

    async isCheckboxSelected(blockName, label) {
        try {
            let locator = lib.FILTER_PANEL.aggregationGroupDiv(blockName) + XPATH.aggregationCheckboxByName(label);
            await this.waitForElementDisplayed(locator, appConst.shortTimeout);
            return await this.isSelected(locator);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_filter_panel_checkbox');
            throw new Error("Filter Panel, Error during checking the checkbox , screenshot:" + screenshot + ' ' + err);
        }
    }

    async waitForAggregationGroupDisplayed(blockName) {
        let selector = lib.FILTER_PANEL.aggregationGroupDiv(blockName);
        return await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
    }

    async waitForCheckboxNotDisplayed(blockName, checkBoxLabel) {
        let selector = lib.FILTER_PANEL.aggregationGroupDiv(blockName) + XPATH.aggregationLabelByName(checkBoxLabel);
        return await this.waitForElementNotDisplayed(selector, appConst.mediumTimeout);
    }

    //clicks on a checkbox in Workflow aggregation block
    async clickOnCheckboxInWorkflowBlock(checkBoxLabel) {
        try {
            let selector = lib.FILTER_PANEL.aggregationGroupDiv(appConst.FILTER_PANEL_AGGREGATION_BLOCK.WORKFLOW) +
                           XPATH.aggregationLabelByName(checkBoxLabel);
            await this.waitForElementDisplayed(selector, appConst.shortTimeout);
            await this.clickOnElement(selector);
            return await this.pause(1200);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_click_on_aggregation"));
            throw new Error("Error when click on the aggregation checkbox: " + err);
        }
    }

    async clickOnCheckboxInLanguageBlock(checkBoxLabel) {
        try {
            let selector = lib.FILTER_PANEL.aggregationGroupDiv(appConst.FILTER_PANEL_AGGREGATION_BLOCK.LANGUAGE) +
                           XPATH.aggregationLabelByName(checkBoxLabel);
            await this.waitForElementDisplayed(selector, appConst.shortTimeout);
            await this.clickOnElement(selector);
            return await this.pause(1200);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName("err_click_on_aggregation");
            throw new Error("Error when click on the aggregation checkbox, screenshot: " + screenshot + ' ' + err);
        }
    }

    // gets a number of items from a checkbox label in an aggregation block(Workflow,modifier)
    async getNumberOfItemsInAggregationView(blockName, checkboxLabel, showMore) {
        if (typeof showMore !== 'undefined') {
            if (showMore && await this.isShowMoreButtonDisplayed()) {
                await this.clickOnShowMoreButton();
            }
        }
        try {
            let locator = lib.FILTER_PANEL.aggregationGroupDiv(blockName) + XPATH.aggregationLabelByName(checkboxLabel);
            await this.waitForElementDisplayed(locator, appConst.shortTimeout);
            let label = await this.getText(locator);
            let startIndex = label.indexOf('(');
            let endIndex = label.indexOf(')');
            return label.substring(startIndex + 1, endIndex);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_numb_in_aggregation'));
            throw new Error("Error when get the number in aggregation checkbox: " + err);
        }
    }

    async getNumberOfItemsInFolderAggregation() {
        let locator = XPATH.folderAggregation();
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);
        let label = await this.getText(locator);
        let startIndex = label.indexOf('(');
        let endIndex = label.indexOf(')');
        return label.substring(startIndex + 1, endIndex);
    }

    //Gets items in "Content Types" block:
    async geContentTypes() {
        let locator = lib.FILTER_PANEL.aggregationGroupDiv('Content Types') + "//div[contains(@class,'checkbox')]//label";
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);
        return await this.getTextInDisplayedElements(locator);
    }

    async getLastModifiedCount(timestamp) {
        let locator = XPATH.lastModifiedAggregationEntry(timestamp);
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);
        let label = await this.getText(locator);
        let startIndex = label.indexOf('(');
        let endIndex = label.indexOf(')');
        return label.substring(startIndex + 1, endIndex);
    }

    async getOwnerNameInSelector() {
        let owners = [];
        let optionsLocator = lib.FILTER_PANEL.ownerAggregationGroupView + lib.FILTER_PANEL.selectorOptionItem + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(optionsLocator, appConst.shortTimeout);
        let result = await this.getTextInDisplayedElements(optionsLocator);
        result.map(item => {
            let value = item.substring(0, item.indexOf('('));
            owners.push(value.trim());
        })
        return owners;
    }

    async expandOwnerOptionsAndSelectItem(ownerName) {
        try {
            await this.clickOnOwnerDropdownHandle();
            let checkboxLocator = lib.FILTER_PANEL.ownerAggregationGroupView + XPATH.selectorOptionItemByLabel(ownerName);
            await this.waitForElementDisplayed(checkboxLocator, appConst.mediumTimeout);
            await this.clickOnElement(checkboxLocator);
            let okButton = lib.FILTER_PANEL.ownerAggregationGroupView + "//button[child::span[text()='OK']]";
            await this.waitForElementDisplayed(okButton, appConst.mediumTimeout);
            await this.clickOnElement(okButton);
            await this.pause(300);
        } catch (err) {
            let screenshot = await this.saveScreenshot('err_filter_owner');
            throw new Error("Error when selecting an option in Owner Selector, screenshot " + screenshot + ' ' + err);
        }
    }

    async getTextInHitsCounter() {
        let locator = XPATH.container + "//span[@class='hits-counter']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator);
    }
}

module.exports = ArchiveFilterPanel;
