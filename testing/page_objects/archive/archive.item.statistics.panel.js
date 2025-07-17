/**
 * Created on 06.12.2021
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPATH = {
    container: "//div[contains(@id,'ArchiveItemStatisticsPanel')]",
    archiveItemPreviewToolbar: "//div[contains(@id,'ArchiveItemPreviewToolbar')]",
    contentStatus: "//span[@class='status']",
    divEmulatorDropdown: "//div[contains(@id,'EmulatorDropdown')]",
    divPreviewWidgetDropdown: "//div[contains(@id,'PreviewWidgetDropdown')]",
};

class ArchiveItemStatisticsPanel extends Page {

    get contentStatus() {
        return XPATH.container + XPATH.archiveItemPreviewToolbar + XPATH.contentStatus;
    }

    get emulatorDropdown() {
        return XPATH.archiveItemPreviewToolbar + XPATH.divEmulatorDropdown;
    }

    get previewWidgetDropdown() {
        return XPATH.archiveItemPreviewToolbar + XPATH.divPreviewWidgetDropdown;
    }

    get previewButton() {
        return XPATH.archiveItemPreviewToolbar + "//button[contains(@id, 'ActionButton') and contains(@aria-label,'Open in new tab')]";
    }

    async getStatus() {
        try {
            await this.waitForElementDisplayed(this.contentStatus, appConst.mediumTimeout);
            return await this.getText(this.contentStatus);
        } catch (err) {
            let screenshot = await this.saveScreenshot('err_get_content_status');
            throw new Error(`error when getting archive status, screenshot:${screenshot} ` + err);
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

    // Clicks on the dropdown handle in the 'Preview dropdown' then clicks on a list-item by its name
    async selectOptionInPreviewWidget(optionName) {
        await this.waitForPreviewWidgetDropdownDisplayed();
        await this.clickOnElement(this.previewWidgetDropdown);
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
            await this.handleError(`Preview widget - dropdown - should not be displayed`, 'err_preview_widget_dropdown', err);
        }
    }

    // Waits for the image to be displayed in the iframe(Live View)
    async waitForImageElementDisplayed() {
        try {
            let locator = "//img";
            await this.switchToFrame(XPATH.container + "//iframe[@class='image']");
            return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Image element - should be displayed in the iframe`, 'err_image_element', err);
        }
    }

    async waitForPreviewButtonEnabled() {
        try {
            await this.waitForPreviewButtonDisplayed();
            await this.waitForElementEnabled(this.previewButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Preview button - should be displayed and enabled`, 'err_preview_btn_enabled', err);
        }
    }

    async waitForPreviewButtonNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(this.previewButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Preview button - should not be displayed`, 'err_preview_btn_not_displayed', err);
        }
    }

    // Waits for the 'Preview' button to be displayed in the Preview Toolbar
    async waitForPreviewButtonDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.previewButton, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError(`Preview button - should be displayed`, 'err_preview_btn', err);
        }
    }

    async clickOnPreviewButton() {
        try {
            await this.waitForPreviewButtonEnabled();
            await this.clickOnElement(this.previewButton);
            return await this.pause(2000);
        } catch (err) {
            await this.handleError(`Tried to click on 'Preview' button`, 'err_preview_btn', err);
        }
    }

    async waitForPreviewButtonDisabled() {
        try {
            await this.waitForPreviewButtonDisplayed();
            await this.waitForElementDisabled(this.previewButton, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError(`Preview button - should be displayed and disabled`, 'err_preview_btn_disabled', err);
        }
    }
}

module.exports = ArchiveItemStatisticsPanel;
