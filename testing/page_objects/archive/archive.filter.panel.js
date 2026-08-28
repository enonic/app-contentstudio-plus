/**
 * Created on 15.05.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ArchiveFilterPanel')]",
    // All controls of the panel are rendered by the BrowseFilter component. The legacy panel contains one more
    // search input(it is not used any longer), so all locators are scoped to this container:
    browseFilter: "//div[contains(@id,'BrowseFilterElement')]",
    searchInput: "//input[@data-component='SearchField.Input']",
    // 'Clear' button is displayed in the row with the 'Search' title, only when the filter is dirty:
    clearFilterButton: "//div[child::h3[contains(@class,'font-semibold')]]//button",
    // Number of hits - '12 results':
    resultsCounter: "//span[contains(@class,'text-lg')]",
    aggregationGroupTitle: "//h4[contains(@class,'font-semibold')]",
    // Static aggregation groups(Content Types, Archived, Archived By) show the title in h4,
    // filterable groups(with a combobox) show it in a div:
    aggregationGroupByName: name => `//div[child::h4[contains(.,'${name}')] or child::div[contains(@class,'font-semibold') and contains(.,'${name}')]]`,
    checkbox: `//div[@data-component='Checkbox']`,
    checkboxByLabel: label => `//div[@data-component='Checkbox' and descendant::span[contains(.,'${label}')]]`,
    // The input is 'sr-only', so it is not displayed. Its state is in the 'aria-checked' attribute:
    checkboxInput: `//input[@type='checkbox']`,
    checkboxLabel: `//label`,
    folderCheckboxLabel: `//div[@data-component='Checkbox' and descendant::span[contains(.,'Folder') and not(contains(.,'Template'))]]//label`,
    // 'Show more' / 'Show less' button is displayed in the aggregation group with more than 5 buckets:
    showMoreButton: `//button[@data-component='Button' and @aria-label='Show more']`,
    showLessButton: `//button[@data-component='Button' and @aria-label='Show less']`,
};

class ArchiveFilterPanel extends Page {

    get searchTextInput() {
        return XPATH.container + XPATH.browseFilter + XPATH.searchInput;
    }

    get clearFilterLink() {
        return XPATH.container + XPATH.browseFilter + XPATH.clearFilterButton;
    }

    get resultsCounter() {
        return XPATH.container + XPATH.browseFilter + XPATH.resultsCounter;
    }

    get showMoreTypesButton() {
        return this.getAggregationGroupLocator(appConst.FILTER_PANEL_AGGREGATION_BLOCK.CONTENT_TYPES) + XPATH.showMoreButton;
    }

    get showLessTypesButton() {
        return this.getAggregationGroupLocator(appConst.FILTER_PANEL_AGGREGATION_BLOCK.CONTENT_TYPES) + XPATH.showLessButton;
    }

    getAggregationGroupLocator(blockName) {
        return XPATH.container + XPATH.browseFilter + XPATH.aggregationGroupByName(blockName);
    }

    getCheckboxLabelLocator(blockName, label) {
        return this.getAggregationGroupLocator(blockName) + XPATH.checkboxByLabel(label) + XPATH.checkboxLabel;
    }

    getCheckboxInputLocator(blockName, label) {
        return this.getAggregationGroupLocator(blockName) + XPATH.checkboxByLabel(label) + XPATH.checkboxInput;
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
            await this.waitForElementDisplayed(this.searchTextInput, appConst.mediumTimeout);
            await this.pause(500);
        } catch (err) {
            await this.handleError('Archive Filter Panel was not opened', 'err_archive_filter_panel', err);
        }
    }

    isPanelVisible() {
        return this.isElementDisplayed(XPATH.container);
    }

    async typeSearchText(text) {
        try {
            await this.typeTextInInput(this.searchTextInput, text);
            return await this.pause(500);
        } catch (err) {
            await this.handleError('Filter Panel, Search Input', 'err_filter_panel_search_input', err);
        }
    }

    async getTextInSearchInput() {
        let input = await this.findElement(this.searchTextInput);
        return await input.getValue();
    }

    async clearSearchInput() {
        let input = await this.findElement(this.searchTextInput);
        await input.clearValue();
        return await this.pause(500);
    }

    // Returns the text in the results counter - '12 results'
    async getTextInHitsCounter() {
        await this.waitForElementDisplayed(this.resultsCounter, appConst.mediumTimeout);
        return await this.getText(this.resultsCounter);
    }

    // Returns the number from the results counter
    async getNumberInHitsCounter() {
        let text = await this.getTextInHitsCounter();
        return parseInt(text, 10);
    }

    waitForClearLinkDisplayed() {
        return this.waitForElementDisplayed(this.clearFilterLink, appConst.mediumTimeout);
    }

    waitForClearLinkNotDisplayed() {
        return this.waitForElementNotDisplayed(this.clearFilterLink, appConst.mediumTimeout);
    }

    async clickOnClearButton() {
        await this.waitForClearLinkDisplayed();
        await this.clickOnElement(this.clearFilterLink);
        await this.pause(1000);
    }

    async waitForAggregationGroupDisplayed(blockName) {
        try {
            return await this.waitForElementDisplayed(this.getAggregationGroupLocator(blockName), appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Filter Panel: aggregation group ${blockName}`, 'err_filter_panel_aggregation', err);
        }
    }

    async waitForAggregationGroupNotDisplayed(blockName) {
        return await this.waitForElementNotDisplayed(this.getAggregationGroupLocator(blockName), appConst.mediumTimeout);
    }

    // Titles of the aggregation groups: 'Content Types', 'Archived', 'Archived By'
    async getAggregationGroupTitles() {
        let locator = XPATH.container + XPATH.browseFilter + XPATH.aggregationGroupTitle;
        return await this.getTextInDisplayedElements(locator);
    }

    async waitForCheckboxDisplayed(blockName, label) {
        return await this.waitForElementDisplayed(this.getCheckboxLabelLocator(blockName, label), appConst.mediumTimeout);
    }

    async waitForCheckboxNotDisplayed(blockName, label) {
        return await this.waitForElementNotDisplayed(this.getCheckboxLabelLocator(blockName, label), appConst.mediumTimeout);
    }

    async clickOnAggregationCheckbox(blockName, label) {
        try {
            let locator = this.getCheckboxLabelLocator(blockName, label);
            await this.waitForCheckboxDisplayed(blockName, label);
            await this.clickOnElement(locator);
            return await this.pause(1200);
        } catch (err) {
            await this.handleError('Filter Panel, aggregation checkbox', 'err_filter_panel_checkbox', err);
        }
    }

    // clicks on a checkbox in 'Content Types' aggregation block
    async clickOnCheckboxInContentTypesBlock(contentType) {
        try {
            await this.pause(500);
            let showMore = await this.getDisplayedElements(this.showMoreTypesButton);
            if (showMore.length > 0) {
                await this.clickOnShowMoreButton();
            }
            return await this.clickOnAggregationCheckbox(appConst.FILTER_PANEL_AGGREGATION_BLOCK.CONTENT_TYPES, contentType);
        } catch (err) {
            await this.handleError('Filter Panel, aggregation checkbox', 'err_filter_panel_checkbox', err);
        }
    }

    // The input is 'sr-only', so the state is checked by the 'aria-checked' attribute
    async isCheckboxSelected(blockName, label) {
        try {
            let locator = this.getCheckboxInputLocator(blockName, label);
            await this.waitForExist(locator, appConst.mediumTimeout);
            let value = await this.getAttribute(locator, 'aria-checked');
            return value === 'true';
        } catch (err) {
            await this.handleError('Filter Panel, aggregation checkbox', 'err_filter_panel_checkbox', err);
        }
    }

    // Labels of all checkboxes in the aggregation block: ['Executable (4)', 'Folder (2)', ...]
    async getCheckboxesLabels(blockName) {
        let locator = this.getAggregationGroupLocator(blockName) + XPATH.checkbox + XPATH.checkboxLabel;
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);
        return await this.getTextInDisplayedElements(locator);
    }

    // Items in 'Content Types' block:
    async geContentTypes() {
        return await this.getCheckboxesLabels(appConst.FILTER_PANEL_AGGREGATION_BLOCK.CONTENT_TYPES);
    }

    // gets the number of items from a checkbox label in an aggregation block: 'Executable (4)' returns '4'
    async getNumberOfItemsInAggregationView(blockName, checkboxLabel, showMore) {
        if (typeof showMore !== 'undefined') {
            if (showMore && await this.isShowMoreButtonDisplayed()) {
                await this.clickOnShowMoreButton();
            }
        }
        try {
            let locator = this.getCheckboxLabelLocator(blockName, checkboxLabel);
            await this.waitForElementDisplayed(locator, appConst.shortTimeout);
            let label = await this.getText(locator);
            return this.getNumberFromLabel(label);
        } catch (err) {
            await this.handleError('Filter Panel, number in aggregation checkbox', 'err_get_numb_in_aggregation', err);
        }
    }

    // 'Folder' should not be mixed up with 'Template Folder' in the 'Content Types' block
    async getNumberOfItemsInFolderAggregation() {
        let locator = this.getAggregationGroupLocator(appConst.FILTER_PANEL_AGGREGATION_BLOCK.CONTENT_TYPES) +
                      XPATH.folderCheckboxLabel;
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);
        let label = await this.getText(locator);
        return this.getNumberFromLabel(label);
    }

    getNumberFromLabel(label) {
        let startIndex = label.indexOf('(');
        let endIndex = label.indexOf(')');
        return label.substring(startIndex + 1, endIndex);
    }

    waitForShowMoreButtonDisplayed() {
        return this.waitForElementDisplayed(this.showMoreTypesButton, appConst.shortTimeout);
    }

    waitForShowMoreButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.showMoreTypesButton, appConst.shortTimeout);
    }

    isShowMoreButtonDisplayed() {
        return this.isElementDisplayed(this.showMoreTypesButton);
    }

    async clickOnShowMoreButton() {
        await this.waitForShowMoreButtonDisplayed();
        await this.clickOnElement(this.showMoreTypesButton);
        return await this.pause(300);
    }

    waitForShowLessButtonDisplayed() {
        return this.waitForElementDisplayed(this.showLessTypesButton, appConst.shortTimeout);
    }

    waitForShowLessButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.showLessTypesButton, appConst.shortTimeout);
    }

    async clickOnShowLessButton() {
        await this.waitForShowLessButtonDisplayed();
        await this.clickOnElement(this.showLessTypesButton);
        return await this.pause(300);
    }
}

module.exports = ArchiveFilterPanel;
