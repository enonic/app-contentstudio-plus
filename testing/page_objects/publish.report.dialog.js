/**
 * Created on 27.11.2023
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const lib = require('../libs/elements');
const XPATH = {
    container: `//div[contains(@id,'PublishReportDialog')]`,
    comparisonsContainer: "//div[contains(@id,'ComparisonsContainer')]",
    comparisonBlockDiv: "//div[contains(@id,'ComparisonBlock')]",
    textAndDateHeader: "//div[@class='header']/div[contains(@id,'TextAndDateBlock')]",
    textAndDateSubheader: "//div[contains(@id,'TextAndDateBlock') and contains(@class,'subtitle')]",
};

class PublishReportDialog extends Page {

    get showEntireContentCheckbox() {
        return XPATH.container + XPATH.comparisonBlockDiv + lib.DIV.SHOW_ENTIRE_CONTENT_CHECKBOX_DIV;
    }

    get printButton() {
        return XPATH.container + lib.dialogButton('Print');
    }

    get cancelTopButton() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    async getHeaderInComparisonBlock(index) {
        try {
            let locator = XPATH.container + XPATH.comparisonBlockDiv + XPATH.textAndDateHeader + "/span[@class='text'][1]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            let elements = await this.findElements(locator)
            return await elements[index].getText();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_comparison_header');
            throw new Error(`PublishReport modal dialog, header block, screenshot: ${screenshot} ` + err);
        }
    }

    async getSubtitleInComparisonBlock(index) {
        try {
            let locator = XPATH.container + XPATH.comparisonBlockDiv + XPATH.textAndDateSubheader + "/span[@class='text'][1]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            let elements = await this.findElements(locator)
            return await elements[index].getText();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_date_subtitle');
            throw new Error(`PublishReport modal dialog, subtitle block, screenshot: ${screenshot} ` + err);
        }
    }

    async getDateInHeaderOfComparisonBlock(index) {
        try {
            let locator = XPATH.container + XPATH.comparisonBlockDiv + XPATH.textAndDateHeader + "/span[@class='date']";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            let elements = await this.findElements(locator)
            return await elements[index].getText();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_date_header');
            throw new Error(`PublishReport modal dialog, date in the header block, screenshot: ${screenshot} ` + err);
        }
    }

    async getAllComparisonsBlockHeader() {
        try {
            let locator = XPATH.comparisonsContainer + "/div[contains(@id,'TextAndDateBlock')]" + "/span[@class='text']";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.getText(locator);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_dlg_header');
            throw new Error(`PublishReport modal dialog, text in  TextAndDate Block, screenshot: ${screenshot} ` + err);
        }
    }

    async getAllComparisonsDate() {
        try {
            let locator = XPATH.comparisonsContainer + "/div[contains(@id,'TextAndDateBlock')]" + "/span[@class='date']";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.getText(locator);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_dlg_date');
            throw new Error(`PublishReport modal dialog, date in Comparisons Block, screenshot: ${screenshot} ` + err);
        }
    }

    async waitForShowEntireContentCheckboxNotDisplayed() {
        let checkBoxInput = this.showEntireContentCheckbox + lib.INPUTS.CHECKBOX_INPUT;
        return await this.waitForElementNotDisplayed(checkBoxInput, appConst.mediumTimeout);
    }

    async clickOnShowEntireContentCheckbox(index) {
        let checkBoxInput = this.showEntireContentCheckbox + "/label";
        await this.waitForElementDisplayed(this.showEntireContentCheckbox, appConst.mediumTimeout);
        let res = await this.findElements(checkBoxInput);
        if (index > res.length) {
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        return await res[index].click();
    }

    async isShowEntireContentCheckboxSelected(index) {
        let checkBoxInput = this.showEntireContentCheckbox + lib.INPUTS.CHECKBOX_INPUT;
        await this.waitForElementDisplayed(this.showEntireContentCheckbox, appConst.mediumTimeout);
        let res = await this.findElements(checkBoxInput);
        if (index > res.length) {
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        return await res[index].isSelected();

    }

    async clickOnCancelTopButton() {
        await this.waitForElementDisplayed(this.cancelTopButton, appConst.shortTimeout);
        await this.clickOnElement(this.cancelTopButton);
        await this.waitForDialogClosed();
        return await this.pause(200);
    }

    async waitForDialogLoaded() {
        try {
            return await this.waitForElementDisplayed(this.printButton, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_load_publish_report_dlg');
            throw new Error(`PublishReport  dialog was not loaded! screenshot: ${screenshot} ` + err);
        }
    }

    async waitForPrintButtonEnabled() {
        try {
            await this.waitForElementDisplayed(this.printButton, appConst.mediumTimeout);
            await this.waitForElementEnabled(this.printButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_print_btn');
            throw new Error(`PublishReport modal dialog - Print button, screenshot: ${screenshot} ` + err);
        }
    }

    isDialogVisible() {
        return this.isElementDisplayed(XPATH.container);
    }

    async waitForDialogClosed() {
        await this.waitForElementNotDisplayed(XPATH.container, appConst.shortTimeout);
    }
}

module.exports = PublishReportDialog;
