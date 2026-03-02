/**
 * Created on 27.11.2023
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

class PublishReportDialog extends Page {

    async getHeaderInComparisonBlock(index) {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$('div[id*="ComparisonBlock"] div.header > div[id*="TextAndDateBlock"] span.text');
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            return await elements[index].getText();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_comparison_header');
            throw new Error(`PublishReport modal dialog, header block, screenshot: ${screenshot} ` + err);
        }
    }

    async getSubtitleInComparisonBlock(index) {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$('div[id*="ComparisonBlock"] div[id*="TextAndDateBlock"][class*="subtitle"] span.text');
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            return await elements[index].getText();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_date_subtitle');
            throw new Error(`PublishReport modal dialog, subtitle block, screenshot: ${screenshot} ` + err);
        }
    }

    async getDateInHeaderOfComparisonBlock(index) {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$('div[id*="ComparisonBlock"] div.header > div[id*="TextAndDateBlock"] span.date');
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            return await elements[index].getText();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_date_header');
            throw new Error(`PublishReport modal dialog, date in the header block, screenshot: ${screenshot} ` + err);
        }
    }

    async getAllComparisonsBlockHeader() {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$('div[id*="TextAndDateBlock"] span.text');
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            const texts = [];
            for (const el of elements) {
                texts.push(await el.getText());
            }
            return texts;
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_dlg_header');
            throw new Error(`PublishReport modal dialog, text in  TextAndDate Block, screenshot: ${screenshot} ` + err);
        }
    }

    async getAllComparisonsDate() {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$('div[id*="TextAndDateBlock"] span.date');
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            const texts = [];
            for (const el of elements) {
                texts.push(await el.getText());
            }
            return texts;
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_dlg_date');
            throw new Error(`PublishReport modal dialog, date in Comparisons Block, screenshot: ${screenshot} ` + err);
        }
    }

    async waitForShowEntireContentCheckboxNotDisplayed() {
        const host = await this.getShadowHost();
        const checkbox = await host.shadow$('div[id*="ComparisonBlock"] input[type="checkbox"]');
        return await checkbox.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    async clickOnShowEntireContentCheckbox(index) {
        const host = await this.getShadowHost();
        const labels = await host.shadow$$('div[id*="ComparisonBlock"] div[id*="Checkbox"] label');
        if (index >= labels.length) {
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        await labels[0].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await labels[index].click();
    }

    async isShowEntireContentCheckboxSelected(index) {
        const host = await this.getShadowHost();
        const checkboxes = await host.shadow$$('div[id*="ComparisonBlock"] input[type="checkbox"]');
        if (index >= checkboxes.length) {
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        await checkboxes[0].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await checkboxes[index].isSelected();
    }

    async clickOnCancelTopButton() {
        const host = await this.getShadowHost();
        const button = await host.shadow$('div.cancel-button-top');
        await button.waitForDisplayed({timeout: appConst.shortTimeout});
        await button.click();
        await this.waitForDialogClosed();
        return await this.pause(200);
    }

    async waitForDialogLoaded() {
        try {
            const host = await this.getShadowHost();
            const dialog = await host.shadow$('div[id*="PublishReportDialog"]');
            await dialog.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_load_publish_report_dlg');
            throw new Error(`PublishReport  dialog was not loaded! screenshot: ${screenshot} ` + err);
        }
    }

    async waitForPrintButtonEnabled() {
        try {
            const host = await this.getShadowHost();
            const buttons = await host.shadow$$('button[id*="DialogButton"]');
            let printButton;
            for (const btn of buttons) {
                const text = await btn.getText();
                if (text.includes('Print')) {
                    printButton = btn;
                    break;
                }
            }
            await printButton.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await printButton.waitForEnabled({timeout: appConst.mediumTimeout});
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_publish_report_print_btn');
            throw new Error(`PublishReport modal dialog - Print button, screenshot: ${screenshot} ` + err);
        }
    }

    async isDialogVisible() {
        const host = await this.getShadowHost();
        const dialog = await host.shadow$('div[id*="PublishReportDialog"]');
        return await dialog.isDisplayed();
    }

    async waitForDialogClosed() {
        const host = await this.getShadowHost();
        const dialog = await host.shadow$('div[id*="PublishReportDialog"]');
        return await dialog.waitForDisplayed({timeout: appConst.shortTimeout, reverse: true});
    }
}

module.exports = PublishReportDialog;
