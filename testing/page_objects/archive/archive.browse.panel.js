/**
 * Created on 04.11.2021
 */
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const BaseBrowsePanel = require('../../page_objects/base.browse.panel');
const ArchiveContextPanel = require('../browsepanel/detailspanel/archive.context.panel');

const XPATH = {
    container: "//div[contains(@id,'ArchiveBrowsePanel')]",
    toolbar: "//div[contains(@id,'ResponsiveToolbar')]",
    archiveTreeRootListUL: `//ul[contains(@id,'ArchiveTreeRootList')]`,
    listBoxToolbar: `//div[contains(@id,'ListBoxToolbar')]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    selectedRow: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and descendant::div[contains(@class,'slick-cell') and contains(@class,'highlight')]]`,
    checkedRows: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-cell-checkboxsel selected')]`,
    searchButton: "//button[contains(@id, 'ActionButton') and contains(@class, 'icon-search')]",

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
        return XPATH.toolbar + `/*[contains(@id, 'ActionButton') and child::span[text()='Delete...']]`;
    }

    get restoreButton() {
        return XPATH.container + XPATH.toolbar + `/*[contains(@id, 'ActionButton') and child::span[text()='Restore...']]`;
    }

    get treeGrid() {
        return XPATH.container + XPATH.archiveTreeRootListUL;
    }

    get detailsPanelToggleButton() {
        return XPATH.container + lib.DETAILS_PANEL_TOGGLE_BUTTON;
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
        return "//div[contains(@id,'ArchiveFilterPanel')]" + lib.FILTER_PANEL.hideSearchPanelButton;
    }

    get numberInToggler() {
        return XPATH.listBoxToolbar + lib.NUMBER_IN_SELECTION_TOGGLER;
    }

    get displayNames() {
        return XPATH.archiveTreeRootListUL + lib.H6_DISPLAY_NAME;
    }

    waitForRestoreButtonEnabled() {
        return this.waitForElementEnabled(this.restoreButton, appConst.mediumTimeout);
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
        return await this.waitForElementEnabled(this.deleteButton, appConst.mediumTimeout)
    }

    waitForDeleteButtonDisplayed() {
        return this.waitForElementDisplayed(this.deleteButton, appConst.mediumTimeout);
    }

    async waitForContentDisplayed(contentName, ms) {
        try {
            let timeout = ms ? ms : appConst.mediumTimeout;
            console.log("waitForContentDisplayed, timeout is:" + timeout);
            return await this.waitForElementDisplayed(this.treeGrid + lib.itemByName(contentName), timeout);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_wait_for_content_displayed', err);
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = this.treeGrid + lib.itemByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.clickOnElement(nameXpath);
            return await this.pause(600);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_click_on_row_by_display_name', err);
        }
    }

    async waitForContentByDisplayNamePresent(displayName) {
        try {
            let selector = this.treeGrid + lib.itemByDisplayName(displayName);
            return await this.waitForElementDisplayed(selector, appConst.longTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_find');
            throw new Error('Settings: item was not found ! screenshot ' + screenshot + ' ' + err);
        }
    }

    async waitForContentNotDisplayed(contentName) {
        try {
            let selector = this.treeGrid + lib.itemByName(contentName);
            return await this.waitForElementNotDisplayed(selector, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_wait_for_content_not_displayed', err);
        }
    }

    async getNameInHighlightedRow() {
        try {
            await this.waitForElementDisplayed(XPATH.selectedRow, appConst.mediumTimeout);
            return await this.getText(XPATH.selectedRow + lib.H6_DISPLAY_NAME);
        } catch (err) {
            throw new Error(`Error when getting name in the selected row ` + err);
        }
    }

    getNumberOfCheckedRows() {
        return this.findElements(XPATH.checkedRows).then(result => {
            return result.length;
        }).catch(err => {
            throw new Error(`Error when getting selected rows ` + err);
        });
    }

    async rightClickOnItemByDisplayName(displayName) {
        try {
            const nameXpath = XPATH.container + lib.itemByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.doRightClick(nameXpath);
            return await this.waitForContextMenuDisplayed();
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_right_click_on_item', err);
        }
    }

    // Opens/Closes Filter Panel:
    async clickOnSearchButton() {
        await this.waitForElementDisplayed(this.searchButton, appConst.mediumTimeout);
        return await this.clickOnElement(this.searchButton);
    }

    async clickOnHideSearchPanelButton() {
        await this.waitForElementDisplayed(this.hideSearchPanelButton, appConst.mediumTimeout);
        return await this.clickOnElement(this.hideSearchPanelButton);
    }

    async clickCheckboxAndSelectRowByDisplayName(displayName) {
        try {
            let checkboxElement = lib.TREE_GRID.archiveItemTreeGridListElementByDisplayName(displayName) + lib.DIV.CHECKBOX_DIV + '/label';
            await this.waitForElementDisplayed(checkboxElement, appConst.mediumTimeout);
            await this.clickOnElement(checkboxElement);
            return await this.pause(200);
        } catch (err) {
            await this.handleError('Archive Browse Panel', 'err_checkbox_select_item', err);
        }
    }

    async clickOnCheckboxByName(name) {
        let listElements = lib.TREE_GRID.archiveItemTreeGridListElementByName(name);
        let result = await this.findElements(listElements);
        if (result.length === 0) {
            throw new Error('Checkbox was not found!');
        }
        let listElement = result[result.length - 1];
        let checkboxElement = await listElement.$('.' + lib.DIV.CHECKBOX_DIV + '/label');
        // check only the last element:
        await checkboxElement.waitForDisplayed();
        await checkboxElement.click();
        return await this.pause(200);
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

    async waitForRowCheckboxSelected(itemName) {
        let listElements = lib.TREE_GRID.archiveItemTreeGridListElementByName(itemName);
        let result = await this.findElements(listElements);
        if (result === 0) {
            throw new Error('Checkbox was not found!');
        }
        // get the last 'ContentsTreeGridListElement' element:
        let listElement = result[result.length - 1];
        // get the checkbox input for the last 'ContentsTreeGridListElement' element
        let checkboxElement = await listElement.$('.' + lib.INPUTS.CHECKBOX_INPUT);

        await this.getBrowser().waitUntil(async () => {
            let isSelected = await checkboxElement.isSelected();
            return isSelected;
        }, {timeout: appConst.mediumTimeout, timeoutMsg: "Checkbox is not selected"});
    }

    async openDetailsPanel() {
        let archiveContextPanel = new ArchiveContextPanel();
        let result = await archiveContextPanel.isPanelVisible();
        if (!result) {
            await this.clickOnDetailsPanelToggleButton();
        }
        await archiveContextPanel.waitForDetailsPanelLoaded();
        await archiveContextPanel.waitForSpinnerNotVisible(appConst.TIMEOUT_5);
        await this.pause(500);
    }
}

module.exports = ArchiveBrowsePanel;
