/**
 * Created  on 01.04.2022
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');
const lib = require('../../libs/elements');

const XPATH = {
    container: `//div[contains(@id,'CompareContentVersionsDialog')]`,
    contentPanel: "//div[contains(@id,'ModalDialogContentPanel')]",
    containerLeft: `//div[contains(@class,'container left')]`,
    containerRight: `//div[contains(@class,'container right')]`,
    containerBottom: `//div[@class='container bottom']`,
    revertMenuButton: "//button[contains(@id,'Button') and descendant::li[contains(@id,'MenuItem') and text()='Revert']]",
    revertMenuItem: "//ul[contains(@id,'Menu')]/li[contains(@id,'MenuItem') and text()='Revert']",
    showEntireContent: "//div[contains(@id,'Checkbox') and child::label[text()='Show entire content']]"
};

class CompareContentVersionsDialog extends Page {

    get leftRevertMenuButton() {
        return XPATH.container + XPATH.containerLeft + XPATH.revertMenuButton;
    }

    get rightRevertMenuButton() {
        return XPATH.container + XPATH.containerRight + XPATH.revertMenuButton;
    }

    get olderVersionDropdownHandle() {
        return XPATH.container + XPATH.containerLeft + lib.DROP_DOWN_HANDLE;
    }

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    get currentVersionDropdownHandle() {
        return XPATH.container + XPATH.containerRight + lib.DROP_DOWN_HANDLE;
    }

    get showEntireContent() {
        return XPATH.container + XPATH.showEntireContent + "//label";
    }

    async clickOnLeftRevertMenuButton() {
        await this.waitForLeftRevertButtonDisplayed();
        await this.clickOnElement(this.leftRevertMenuButton);
        return await this.pause(300);
    }

    async waitForLeftRevertMenuItemDisplayed() {
        let selector = XPATH.container + XPATH.containerRight + XPATH.revertMenuItem;
    }

    async waitForLeftRevertButtonDisplayed() {
        return await this.waitForElementDisplayed(this.leftRevertMenuButton, appConst.mediumTimeout);
    }

    async waitForLeftRevertMenuButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.leftRevertMenuButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_compare_versions_menu"));
            throw new Error("Left revert menu button should not be displayed: " + err);
        }
    }

    async waitForRightRevertMenuButtonDisplayed() {
        return await this.waitForElementDisplayed(this.leftRevertMenuButton, appConst.mediumTimeout);
    }

    async waitForRightRevertMenuButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.rightRevertMenuButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_compare_versions_menu"));
            throw new Error("Right revert menu button should not be displayed: " + err);
        }
    }

    async waitForRightRevertMenuButtonDisabled() {
        return await this.waitForElementDisabled(this.rightRevertMenuButton, appConst.mediumTimeout);
    }

    async waitForLeftRevertMenuButtonEnabled() {
        return await this.waitForElementEnabled(this.leftRevertMenuButton, appConst.mediumTimeout);
    }

    async clickOnRightRevertButton() {
        await this.waitForElementDisplayed(this.leftRevertMenuButton, appConst.mediumTimeout);
        return await this.clickOnElement(this.leftRevertMenuButton);
    }

    async clickOnCancelTopButton() {
        return await this.clickOnElement(this.leftRevertMenuButton);
    }

    waitForDialogOpened() {
        return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout).catch(err => {
            throw new Error("CompareContentVersions Dialog is not loaded " + err);
        })
    }

    waitForDialogClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout).catch(err => {
            throw new Error("CompareContentVersions Dialog must be closed " + err);
        })
    }

    async clickOnCancelButtonTop() {
        await this.clickOnElement(this.cancelButtonTop);
        return await this.waitForDialogClosed();
    }

    async clickOnShowEntireContentCheckbox() {
        return this.clickOnElement(this.showEntireContent);
    }

    async getTypeProperty() {
        let locator = XPATH.container + "//li[@data-key='type']//pre";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator);
    }

    async clickOnLeftSelectorDropdownHandle() {
        let locator = XPATH.containerLeft + lib.DROP_DOWN_HANDLE;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.waitForElementEnabled(locator, appConst.mediumTimeout);
        return await this.clickOnElement(locator);
    }

    async clickOnRightSelectorDropdownHandle() {
        let locator = XPATH.containerRight + lib.DROP_DOWN_HANDLE;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.waitForElementEnabled(locator, appConst.mediumTimeout);
        return await this.clickOnElement(locator);
    }

    async clickOnOptionInLeftVersionsSelector(optionName) {
        let locator = XPATH.containerLeft + `//div[contains(@class,'slick-cell') and descendant::h6[contains(.,'${optionName}')]]`;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.clickOnElement(locator);
    }

    async waitForContentPanelIsEmpty() {
        let locator = XPATH.container + XPATH.contentPanel + "//div[contains(@class,'jsondiffpatch-delta empty')]";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator + "//h3");
    }
}

module.exports = CompareContentVersionsDialog;
