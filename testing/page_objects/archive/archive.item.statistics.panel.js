/**
 * Created on 06.12.2021
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ArchiveItemStatisticsPanel')]",
    noPreviewMessageSpan: "//div[contains(@class,'no-preview-message')]//span",
    archiveItemPreviewToolbar: "//div[contains(@id,'ArchiveItemPreviewToolbar')]",
    contentStatus: "//span[@class='status']",
    divEmulatorDropdown: "//div[contains(@id,'EmulatorDropdown')]",
    divPreviewWidgetDropdown: "//div[contains(@id,'PreviewModeDropdown')]",
};

class ArchiveItemStatisticsPanel extends Page {

    get contentStatus() {
        return XPATH.container + XPATH.archiveItemPreviewToolbar + XPATH.contentStatus;
    }

    get liveViewFrame() {
        return XPATH.container + '//iframe';
    }

    get emulatorDropdown() {
        return XPATH.archiveItemPreviewToolbar + XPATH.divEmulatorDropdown;
    }

    get previewWidgetDropdown() {
        return XPATH.archiveItemPreviewToolbar + XPATH.divPreviewWidgetDropdown;
    }

    get previewButton() {
        return XPATH.archiveItemPreviewToolbar + "//button[contains(@id, 'ActionButton') and contains(@aria-label,'Preview')]";
    }

    async getStatus() {
        try {
            await this.waitForElementDisplayed(this.contentStatus, appConst.mediumTimeout);
            return await this.getText(this.contentStatus);
        } catch (err) {
            await this.handleError(`Archive Item Statistics Panel - tried to get the content status`, 'err_get_content_status', err);
        }
    }

    async waitForContentStatusNotDisplayed() {
        return await this.waitForElementNotDisplayed(this.contentStatus, appConst.mediumTimeout);
    }

    async getSelectedOptionInEmulatorDropdown() {
        try {
            let locator = this.emulatorDropdown + lib.H6_DISPLAY_NAME;
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.getText(locator);
        } catch (err) {
            await this.handleError(`Emulator dropdown - getting the selected option`, 'err_emulator_dropdown', err)
        }
    }

    // Expands the emulator menu:
    async clickOnEmulatorDropdown() {
        await this.waitForElementDisplayed(this.emulatorDropdown, appConst.mediumTimeout);
        return await this.clickOnElement(this.emulatorDropdown);
    }

    // Expands the emulator menu and clicks on a list-item by its name
    async selectOptionInEmulatorDropdown(optionName) {
        await this.waitForElementDisplayed(this.emulatorDropdown, appConst.mediumTimeout);
        await this.clickOnElement(this.emulatorDropdown);
        let optionSelector = this.emulatorDropdown + lib.DROPDOWN_SELECTOR.listItemByDisplayName(optionName);
        await this.waitForElementDisplayed(optionSelector, appConst.mediumTimeout);
        return await this.clickOnElement(optionSelector);
    }

    // Gets the selected option in the 'Preview dropdown' Auto, Media, etc.
    async getSelectedOptionInPreviewWidget() {
        let locator = this.previewWidgetDropdown + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getText(locator);
    }

    async clickOnPreviewModeDropdownHandle() {
        try {
            let locator = this.previewWidgetDropdown + "//button[contains(@id,'DropdownHandle')]";
            await this.waitForPreviewWidgetDropdownDisplayed();
            await this.pause(300);
            await this.clickOnElement(locator);
            await this.pause(300);
        } catch (err) {
            await this.handleError('Tried to click on Preview dropdown handle.', 'err_preview_dropdown_handle', err);
        }
    }

    // Clicks on the dropdown handle in the 'Preview dropdown' then clicks on a list-item by its name
    async selectOptionInPreviewWidget(optionName) {
        await this.waitForPreviewWidgetDropdownDisplayed();
        let optionSelector = this.previewWidgetDropdown + lib.DROPDOWN_SELECTOR.listItemByDisplayName(optionName);
        await this.waitForElementDisplayed(optionSelector, appConst.mediumTimeout);
        await this.clickOnElement(optionSelector);
        await this.pause(200);
    }

    async waitForPreviewWidgetDropdownDisplayed() {
        return await this.waitForElementDisplayed(this.previewWidgetDropdown, appConst.mediumTimeout);
    }

    async waitForPreviewWidgetDropdownNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.previewWidgetDropdown, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Preview widget dropdown - should not be displayed`, 'err_preview_widget_dropdown_not_displayed', err);
        }
    }

    // Waits for the image to be displayed in the iframe(Live View)
    async waitForImageElementDisplayed() {
        try {
            let locator = "//img";
            await this.switchToFrame(XPATH.container + "//iframe[@class='image']");
            return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Item Statistics - Image element - should be displayed`, 'err_image_element_displayed', err);
        }
    }

    async waitForPreviewButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.previewButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Preview button - should not be displayed`, 'err_preview_btn_not_displayed', err);
        }
    }

    //  gets a text(*.txt) in the Preview panel
    async getTextInAttachmentPreview() {
        try {
            let textLocator = '//body/pre';
            await this.waitForElementDisplayed(textLocator, appConst.mediumTimeout);
            return await this.getText(textLocator);
        } catch (err) {
            await this.handleError(`Archive Content Item Preview - tried to get the text in the preview iframe`, 'err_get_text_preview',
                err);
        }
    }

    async getJsonKeys() {
        try {
            let spanLocator = `//span[@class='key')]`;
            await this.waitForElementDisplayed(spanLocator, appConst.mediumTimeout);
            return await this.getText(spanLocator);
        } catch (err) {
            await this.handleError(`Archive Content Item Preview - tried to get the text in the preview iframe`, 'err_get_text_preview',
                err);
        }
    }

    async switchToLiveViewFrame() {
        return await this.switchToFrame(this.liveViewFrame);
    }

    async getNoPreviewMessage() {
        let locator = XPATH.container + XPATH.noPreviewMessageSpan;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        return await this.getTextInDisplayedElements(locator);
    }
}

module.exports = ArchiveItemStatisticsPanel;
