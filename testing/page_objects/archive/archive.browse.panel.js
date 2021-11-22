/**
 * Created on 04.11.2021
 */
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const BaseBrowsePanel = require('../../page_objects/base.browse.panel');


const XPATH = {
    container: "//div[contains(@id,'ArchiveBrowsePanel')]",
    settingsAppContainer: "//div[contains(@id,'SettingsAppContainer')]",
    toolbar: "//div[contains(@id,'Toolbar')]",
    archiveTreeGrid: `//div[contains(@id,'ArchiveTreeGrid')]`,
    treeGridToolbar: `//div[contains(@id,'TreeGridToolbar')]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    numberInSelectionToggler: `//button[contains(@id,'SelectionPanelToggler')]/span`,
    selectedRow: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and descendant::div[contains(@class,'slick-cell') and contains(@class,'highlight')]]`,
    checkedRows: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-cell-checkboxsel selected')]`,

    contextMenuItemByName: (name) => {
        return `${lib.TREE_GRID_CONTEXT_MENU}/li[contains(@id,'MenuItem') and contains(.,'${name}')]`;
    },

    contentSummaryListViewerByName: function (name) {
        return `//div[contains(@id,'ContentSummaryListViewer') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    contentSummaryByName: function (name) {
        return `//div[contains(@id,'ContentSummaryListViewer') and descendant::p[contains(@class,'sub-name') and contains(.,'${name}')]]`
    },
    contentSummaryByDisplayName: function (displayName) {
        return `//div[contains(@id,'ContentSummaryListViewer') and descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    publishMenuItemByName: function (name) {
        return `//ul[contains(@id,'Menu')]//li[contains(@id,'MenuItem') and contains(.,'${name}')]`
    },
    rowByDisplayName:
        displayName => `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`,

    checkboxByName: function (name) {
        return `${lib.itemByName(
            name)}/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`
    },

    expanderIconByName: function (name) {
        return lib.itemByName(name) +
               `/ancestor::div[contains(@class,'slick-cell')]/span[contains(@class,'collapse') or contains(@class,'expand')]`;
    },
}

class ArchiveBrowsePanel extends BaseBrowsePanel {

    get deleteButton() {
        return XPATH.toolbar + `/*[contains(@id, 'ActionButton') and child::span[text()='Delete...']]`;
    }

    get restoreButton() {
        return XPATH.settingsAppContainer + `/*[contains(@id, 'ActionButton') and child::span[text()='Restore...']]`;
    }

    get treeGrid() {
        return XPATH.container + XPATH.archiveTreeGrid;
    }

    get selectionControllerCheckBox() {
        return XPATH.container + XPATH.treeGridToolbar + XPATH.selectionControllerCheckBox;
    }

    get selectionPanelToggler() {
        return `${XPATH.container}${XPATH.treeGridToolbar}${lib.SELECTION_PANEL_TOGGLER}`;
    }

    get numberInToggler() {
        return XPATH.treeGridToolbar + XPATH.numberInSelectionToggler;
    }

    get displayNames() {
        return XPATH.archiveTreeGrid + lib.H6_DISPLAY_NAME;
    }

    async clickOnExpanderIcon(name) {
        try {
            let expanderIcon = XPATH.itemsTreeGrid + XPATH.expanderIconByName(name);
            await this.clickOnElement(expanderIcon);
            return await this.pause(1100);
        } catch (err) {
            this.saveScreenshot('err_click_on_expander');
            throw new Error('error when click on expander-icon ' + err);
        }
    }

    async waitForContentDisplayed(contentName, ms) {
        try {
            let timeout = ms ? ms : appConst.mediumTimeout;
            console.log("waitForContentDisplayed, timeout is:" + timeout);
            return await this.waitForElementDisplayed(this.treeGrid + lib.itemByName(contentName), timeout);
        } catch (err) {
            console.log("item is not displayed:" + contentName);
            awthis.saveScreenshot('err_find_' + contentName);
            throw new Error('content is not displayed ! ' + contentName + "  " + err);
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = this.treeGrid + lib.itemByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.clickOnElement(nameXpath);
            return await this.pause(600);
        } catch (err) {
            await this.saveScreenshot('err_find_' + displayName);
            throw Error('Row with the displayName ' + displayName + ' was not found' + err)
        }
    }


    async waitForContentByDisplayNamePresent(displayName) {
        try {
            let selector = this.treeGrid + lib.itemByDisplayName(displayName);
            return await this.waitForElementDisplayed(selector, appConst.longTimeout);
        } catch (err) {
            console.log("item is not displayed:" + displayName);
            await this.saveScreenshot('err_find_' + displayName);
            throw new Error('Settings: item was not found ! ' + displayName + "  " + err);
        }
    }

    async waitForContentNotDisplayed(contentName) {
        try {
            let selector = this.treeGrid + lib.itemByName(contentName);
            return await this.waitForElementNotDisplayed(selector, appConst.mediumTimeout);
        } catch (err) {
            throw new Error("The content is still displayed :" + err);
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = this.treeGrid + lib.itemByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.clickOnElement(nameXpath);
            return await this.pause(300);
        } catch (err) {
            this.saveScreenshot('err_find_' + displayName);
            throw Error('Archive Browse Panel - Row with the displayName ' + displayName + ' was not found' + err)
        }
    }

    async clickOnCheckbox(name) {
        let checkBox = XPATH.checkboxByName(name);
        await this.waitForElementDisplayed(checkBox, appConst.mediumTimeout);
        await this.clickOnElement(checkBox);
        return await this.pause(300);
    }

    async clickOnCheckboxAndSelectRowByName(name) {
        try {
            await this.clickOnCheckbox(name);
            await this.waitForRowCheckboxSelected(name);
        } catch (err) {
            await this.saveScreenshot('err_select_item');
            throw Error('Row with the name ' + name + ' was not selected ' + err)
        }
    }

    getNumberOfSelectedRows() {
        return this.findElements(XPATH.selectedRow).then(result => {
            return result.length;
        }).catch(err => {
            throw new Error(`Error when getting selected rows ` + err);
        });
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

    isExpanderIconPresent(name) {
        let expanderIcon = XPATH.treeGrid + XPATH.expanderIconByName(name);
        return this.waitForElementDisplayed(expanderIcon, appConst.shortTimeout).catch(err => {
            this.saveScreenshot('expander_not_exists ' + name);
            return false;
        })
    }

    rightClickOnItemByDisplayName(displayName) {
        const nameXpath = XPATH.container + XPATH.rowByDisplayName(displayName);
        return this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout).then(() => {
            return this.doRightClick(nameXpath);
        }).catch(err => {
            throw Error(`Error when do right click on the row:` + err);
        })
    }
}

module.exports = ArchiveBrowsePanel;
