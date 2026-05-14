/**
 * Created on 06.12.2021 updated on 14.05.2026
 */
const Page = require('../page');
const {BUTTONS} = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ArchiveItemStatisticsPanel')]",
    noPreviewMessageSpan: "//div[contains(@class,'no-preview-message')]//span",
    archiveItemPreviewToolbar: "//div[@aria-label='Preview toolbar']",
    contentStatus: "//span[@class='status']",
    divEmulatorDropdown: "//div[contains(@id,'EmulatorDropdown')]",
    divPreviewWidgetDropdown: "//div[contains(@id,'PreviewModeDropdown')]",
    previewToolbarMenuItem: (optionName) => {
        return `//div[contains(@id,'PreviewToolbar') and @role='menu']//div[@role='menuitemradio' and descendant::span[text()='${optionName}']]`
    },
};

class ArchiveItemStatisticsPanel extends Page {

    get contentStatus() {
        return XPATH.container + XPATH.archiveItemPreviewToolbar + XPATH.contentStatus;
    }

    get liveViewFrame() {
        return XPATH.container + '//iframe';
    }

    get emulatorDropdown() {
        return XPATH.container + XPATH.archiveItemPreviewToolbar + BUTTONS.buttonAriaLabel('Open emulator selector');
    }

    get previewWidgetDropdown() {
        return XPATH.container + XPATH.archiveItemPreviewToolbar + BUTTONS.buttonAriaLabel('Open widget selector');
    }


    get previewButton() {
        return XPATH.container + XPATH.archiveItemPreviewToolbar +
               "//button[contains(@id, 'ActionButton') and contains(@aria-label,'Preview')]";
    }

    async getStatus() {
        try {
            await this.waitForElementDisplayed(this.contentStatus);
            return await this.getText(this.contentStatus);
        } catch (err) {
            await this.handleError(`Archive Item Statistics Panel - tried to get the content status`, 'err_get_content_status', err);
        }
    }

    async waitForContentStatusNotDisplayed() {
        return await this.waitForElementNotDisplayed(this.contentStatus);
    }

    async getSelectedOptionInEmulatorDropdown() {
        try {
            let locator = this.emulatorDropdown + '/span';
            await this.waitForElementDisplayed(locator);
            return await this.getText(locator);
        } catch (err) {
            await this.handleError(`Tried to get the selected option in Emulator dropdown.`, 'err_emulator_dropdown', err);
        }
    }

    // Expands the emulator menu:
    async clickOnEmulatorDropdown() {
        await this.waitForElementDisplayed(this.emulatorDropdown);
        return await this.clickOnElement(this.emulatorDropdown);
    }

    // Expands the emulator menu and clicks on a list-item by its name
    async selectOptionInEmulatorDropdown(optionName) {
        let optionSelector = XPATH.previewToolbarMenuItem(optionName);
        await this.waitForElementDisplayed(this.emulatorDropdown);
        await this.clickOnElement(this.emulatorDropdown);
        await this.waitForElementDisplayed(optionSelector);
        return await this.clickOnElement(optionSelector);
    }

    // Gets the selected option in the 'Preview dropdown' Auto, Media, etc.
    async getSelectedOptionInPreviewWidget() {
        let locator = this.previewWidgetDropdown + '/span';
        await this.waitForElementDisplayed(locator);
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

    async selectOptionInPreviewWidget(optionName) {
        try {
            await this.waitForPreviewWidgetDropdownDisplayed();
            await this.clickOnElement(this.previewWidgetDropdown);
            let optionSelector = XPATH.previewToolbarMenuItem(optionName);
            await this.waitForElementDisplayed(optionSelector);
            await this.clickOnElement(optionSelector);
            await this.pause(200);
        } catch (err) {
            await this.handleError(`Tried to select option in Preview Widget: ${optionName}`, 'err_preview_widget', err);
        }
    }

    async waitForPreviewWidgetDropdownDisplayed() {
        return await this.waitForElementDisplayed(this.previewWidgetDropdown);
    }

    async waitForPreviewWidgetDropdownNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.previewWidgetDropdown);
        } catch (err) {
            await this.handleError(`Preview widget dropdown - should not be displayed`, 'err_preview_widget_dropdown_not_displayed', err);
        }
    }

    // Waits for the image to be displayed in the iframe(Live View)
    async waitForImageElementDisplayed() {
        try {
            let locator = "//img";
            await this.switchToFrame(XPATH.container + "//iframe[@class='image']");
            return await this.waitForElementDisplayed(locator);
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
            await this.waitForElementDisplayed(textLocator);
            return await this.getText(textLocator);
        } catch (err) {
            await this.handleError(`Archive Item Preview - tried to get the text in the preview iframe`, 'err_get_text_preview', err);
        }
    }

    async getJsonKeys() {
        try {
            let spanLocator = `//span[@class='key')]`;
            await this.waitForElementDisplayed(spanLocator);
            return await this.getText(spanLocator);
        } catch (err) {
            await this.handleError(`Archive Item Preview - tried to get the text in the preview iframe`, 'err_get_text_preview', err);
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
