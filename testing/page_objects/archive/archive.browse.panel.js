/**
 * Created on 04.11.2021
 */
const {BUTTONS, COMMON, TREE_GRID} = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const BaseBrowsePanel = require('../../page_objects/base.browse.panel');
const ArchiveContextWindowPanel = require('../browsepanel/detailspanel/archive.context.window.panel');

const XPATH = {
    container: "//div[contains(@id,'ArchiveBrowsePanel')]",
    toolbar: "//div[@aria-label='Archive toolbar']",
    archiveTreeListDiv: "//div[@data-component='ArchiveTreeList']",
    searchButton: "//button[contains(@aria-label, 'search panel')]",
    highlightedRowNotChecked: `//div[@role='treeitem' and contains(@class,'bg-surface-selected') and descendant::div[@role='checkbox' and @aria-checked='false']]`,
    hideSearchPanelButton: "//button[contains(@aria-label, 'Hide search panel')]",
    listBoxToolbar: `//div[contains(@id,'ListBoxToolbar')]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    checkedRows: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-cell-checkboxsel selected')]`,


    contentSummaryListViewerByName(name) {
        return `//div[contains(@id,'ContentSummaryListViewer') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    contentSummaryByName(name) {
        return `//div[contains(@id,'ContentSummaryListViewer') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    contentSummaryByDisplayName(displayName) {
        return `//div[contains(@id,'ContentSummaryListViewer') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    publishMenuItemByName(name) {
        return `//ul[contains(@id,'Menu')]//li[contains(@id,'MenuItem') and contains(.,'${name}')]`
    },
    rowByDisplayName:
        displayName => `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`,
};

class ArchiveBrowsePanel extends BaseBrowsePanel {

    get browseToolbar() {
        return XPATH.toolbar;
    }

    get container() {
        return XPATH.container;
    }

    get deleteButton() {
        return XPATH.toolbar + BUTTONS.buttonAriaLabel('Delete');
    }

    get restoreButton() {
        return XPATH.toolbar + BUTTONS.buttonAriaLabel('Restore');
    }

    get treeGrid() {
        return XPATH.container + XPATH.archiveTreeListDiv;
    }

    get showContextPanelButton() {
        return XPATH.container + BUTTONS.buttonAriaLabel('Show context panel');
    }

    get selectionControllerCheckBox() {
        return XPATH.container + XPATH.listBoxToolbar + XPATH.selectionControllerCheckBox;
    }

    get selectionPanelToggler() {
        return `${XPATH.container}${XPATH.listBoxToolbar}${lib.SELECTION_PANEL_TOGGLER}`;
    }

    get searchButton() {
        return XPATH.toolbar + XPATH.searchButton;
    }

    get hideSearchPanelButton() {
        return XPATH.toolbar + XPATH.hideSearchPanelButton;
    }


    get displayNames() {
        // div[1] contains the icon, div[2] contains the name
        return XPATH.archiveTreeListDiv + TREE_GRID.VIRTUALIZED_TREE_ROW + TREE_GRID.CONTENT_LABEL_BLOCK + '//div[2]//span';
    }

    // get displayNames() {
    //     // div[1] contains the icon, div[2] contains the name
    //     return XPATH.archiveTreeListDiv + TREE_GRID.TREE_LIST_DIV + TREE_GRID.TREE_LIST_ITEM_DIV + TREE_GRID.CONTENT_LABEL_BLOCK +
    //            '//div[2]//span';
    // }

    waitForRestoreButtonEnabled() {
        return this.waitForElementEnabled(this.restoreButton);
    }

    async clickOnRestoreButton() {
        try {
            await this.waitForRestoreButtonEnabled();
            await this.clickOnElement(this.restoreButton);
            return await this.pause(1100);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_restore_btn', err);
        }
    }

    async clickOnDeleteButton() {
        await this.waitForDeleteButtonEnabled();
        await this.clickOnElement(this.deleteButton);
        return await this.pause(500);
    }

    async waitForDeleteButtonEnabled() {
        await this.waitForDeleteButtonDisplayed();
        return await this.waitForElementEnabled(this.deleteButton);
    }

    async waitForDeleteButtonDisplayed() {
        return await this.waitForElementDisplayed(this.deleteButton);
    }

    async waitForContentDisplayed(contentName, ms) {
        try {
            let timeout = ms ? ms : appConst.mediumTimeout;
            console.log('waitForContentDisplayed, timeout is:' + timeout);
            let locator = XPATH.archiveTreeListDiv + TREE_GRID.itemByName(contentName);
            return await this.waitForElementDisplayed(locator, timeout);
        } catch (err) {
            await this.handleError(`Content with name ${contentName} is not displayed`, 'err_content_displayed', err);
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = XPATH.archiveTreeListDiv + TREE_GRID.itemByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath);
            await this.clickOnElement(nameXpath);
        } catch (err) {
            await this.handleError(`Tried click on row by displayName: ${displayName}`, 'err_find_content', err);
        }
    }

    async waitForContentNotDisplayed(contentName) {
        let locator = XPATH.archiveTreeListDiv + TREE_GRID.itemByName(contentName);
        try {
            await this.waitForElementNotDisplayed(locator);
        } catch (err) {
            await this.handleError('Content is still displayed', 'err_content_should_not_be_displayed', err);
        }
    }

    // Returns the display name of the highlighted (but not checked) row, or '' when no such row exists.
    async getNameInHighlightedRow() {
        try {
            const locator = XPATH.archiveTreeListDiv + XPATH.highlightedRowNotChecked +
                            TREE_GRID.CONTENT_LABEL_BLOCK + '//div[2]//span';
            const elements = await this.getDisplayedElements(locator);
            if (elements.length === 0) {
                return '';
            }
            return await elements[0].getText();
        } catch (err) {
            await this.handleError(`Tried to get name in highlighted row `, 'err_get_name_in_highlighted_row', err);
        }
    }

    async rightClickOnItemByDisplayName(displayName) {
        try {
            const nameXpath = XPATH.archiveTreeListDiv + TREE_GRID.itemByDisplayName(displayName) + TREE_GRID.TREE_LIST_ITEM_COMPONENT;
            await this.waitForElementDisplayed(nameXpath);
            await this.doRightClick(nameXpath);
            return await this.waitForContextMenuDisplayed();
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_right_click_on_item', err);
        }
    }

    // Opens/Closes Filter Panel:
    async clickOnSearchButton() {
        await this.waitForElementDisplayed(this.searchButton);
        return await this.clickOnElement(this.searchButton);
    }

    async clickOnHideSearchPanelButton() {
        await this.waitForElementDisplayed(this.hideSearchPanelButton);
        return await this.clickOnElement(this.hideSearchPanelButton);
    }

    async clickCheckboxAndSelectRowByDisplayName(displayName) {
        try {
            let checkboxElement = XPATH.archiveTreeListDiv + TREE_GRID.itemByDisplayName(displayName) +
                                  TREE_GRID.TREE_LIST_ITEM_CHECKBOX_LABEL;
            await this.waitForElementDisplayed(checkboxElement, appConst.mediumTimeout);
            await this.clickOnElement(checkboxElement);
            return await this.pause(200);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_checkbox_select_item', err);
        }
    }

    async clickOnCheckboxAndSelectRowByName(name) {
        try {
            await this.clickOnCheckboxByName(name);
            await this.waitForRowCheckboxSelected(name);
            await this.pause(200);
        } catch (err) {
            await this.handleError(`Row with the displayName ${name} was not checked`, 'err_check_item', err);
        }
    }

    async clickOnCheckboxAndSelectRowByName(name) {
        try {
            await this.clickOnCheckboxByName(name);
            await this.waitForRowCheckboxSelected(name);
            await this.pause(200);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_select_item', err);
        }
    }

    async isShowContextPanelButtonDisplayed() {
        return await this.isElementDisplayed(this.showContextPanelButton);
    }

    async openContextWindow() {
        let archiveContextWindow = new ArchiveContextWindowPanel();
        let isDisplayed = await this.isShowContextPanelButtonDisplayed();
        if (isDisplayed) {
            await this.clickOnDetailsPanelToggleButton();
        }
        await archiveContextWindow.waitForOpened();
        await archiveContextWindow.waitForSpinnerNotVisible(appConst.TIMEOUT_5);
        await this.pause(500);
        return archiveContextWindow;
    }
}

module.exports = ArchiveBrowsePanel;
