/**
 * Created on 27.11.2023
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

const selectors = {
    dialog: `div[data-component="PublishReportDialog"]`,
    title: `div[data-component="PublishReportDialog"] h2[data-component="Dialog.Title"]`,
    // Path of the content is displayed in the description of the header:
    description: `div[data-component="PublishReportDialog"] p[data-component="Dialog.Description"]`,
    closeButton: `div[data-component="PublishReportDialog"] button[data-component="Dialog.DefaultClose"]`,
    body: `div[data-component="PublishReportDialog"] div[data-component="Dialog.Body"]`,
    printButton: `div[data-component="PublishReportDialog"] footer[data-component="Dialog.Footer"] button[data-component="Button"]`,
    // ComparisonBlock has no data-component attribute: every block wraps exactly one diff container,
    // so the block is the closest non-diff div around 'div.jsondiffpatch-delta'
    comparisonBlock: `div[data-component="PublishReportDialog"] div:not([class*="jsondiffpatch"]):has(> div.jsondiffpatch-delta)`,
    // 'text' and 'date' spans in a TextAndDate row, the header of a block contains two pairs, when versions are compared:
    textAndDateRow: `div[class*="text-sm"]`,
    text: `span[class*="text-subtle"]`,
    date: `span[class*="font-medium"]`,
    // TextAndDate rows outside of the blocks - 'Item went offline after' in the heading and in the footer of the report:
    offlineRow: `div[data-component="PublishReportDialog"] div[class*="text-sm"][class*="px-4"][class*="py-3"]`,
    // 'No published versions' / 'Content was offline in the selected period' messages:
    noComparisonsMessage: `div[data-component="Dialog.Body"] div[class*="px-4"][class*="text-subtle"]:not([class*="py-3"])`,
    // 'Show entire content' checkbox, the input is hidden behind the label:
    showEntireContentCheckbox: `input[id*="pr-show-all-"]`,
    showEntireContentCheckboxLabel: `label[for*="pr-show-all-"]`,
};

class PublishReportDialog extends Page {

    async getDialogElement() {
        const host = await this.getShadowHost();
        return await host.shadow$(selectors.dialog);
    }

    async getComparisonBlocks() {
        const host = await this.getShadowHost();
        return await host.shadow$$(selectors.comparisonBlock);
    }

    // Returns the TextAndDate rows of the block: the header row and, optionally, the subtitle row
    async getTextAndDateRowsInBlock(index) {
        const blocks = await this.getComparisonBlocks();
        if (index >= blocks.length) {
            throw new Error(`Publish report modal dialog, the number of comparison blocks is less than expected: ${blocks.length}`);
        }
        await blocks[index].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await blocks[index].$$(selectors.textAndDateRow);
    }

    async waitForDialogLoaded() {
        try {
            const dialog = await this.getDialogElement();
            await dialog.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError('PublishReport dialog was not loaded', 'err_load_publish_report_dlg', err);
        }
    }

    async isDialogVisible() {
        const dialog = await this.getDialogElement();
        return await dialog.isDisplayed();
    }

    async waitForDialogClosed() {
        const dialog = await this.getDialogElement();
        return await dialog.waitForDisplayed({timeout: appConst.shortTimeout, reverse: true});
    }

    async getDialogTitle() {
        const host = await this.getShadowHost();
        const title = await host.shadow$(selectors.title);
        await title.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await title.getText();
    }

    // Path of the content, it is displayed in the description of the header
    async getContentPath() {
        const host = await this.getShadowHost();
        const description = await host.shadow$(selectors.description);
        await description.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await description.getText();
    }

    async clickOnCloseButton() {
        const host = await this.getShadowHost();
        const button = await host.shadow$(selectors.closeButton);
        await button.waitForDisplayed({timeout: appConst.shortTimeout});
        await button.click();
        await this.waitForDialogClosed();
        return await this.pause(200);
    }

    async clickOnCancelTopButton() {
        return await this.clickOnCloseButton();
    }

    async getNumberOfComparisonBlocks() {
        const blocks = await this.getComparisonBlocks();
        return blocks.length;
    }

    // Returns the text in the header of the comparison block: 'Item went online' or 'Comparing'
    async getHeaderInComparisonBlock(index) {
        try {
            const rows = await this.getTextAndDateRowsInBlock(index);
            const text = await rows[0].$(selectors.text);
            await text.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await text.getText();
        } catch (err) {
            await this.handleError('PublishReport modal dialog, header block', 'err_publish_report_comparison_header', err);
        }
    }

    // Returns the date in the header of the comparison block
    async getDateInHeaderOfComparisonBlock(index) {
        try {
            const rows = await this.getTextAndDateRowsInBlock(index);
            const date = await rows[0].$(selectors.date);
            await date.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await date.getText();
        } catch (err) {
            await this.handleError('PublishReport modal dialog, date in the header block', 'err_publish_report_date_header', err);
        }
    }

    // Returns the text in the subtitle of the comparison block - 'NB: Item was offline from'
    async getSubtitleInComparisonBlock(index) {
        try {
            const rows = await this.getTextAndDateRowsInBlock(index);
            if (rows.length < 2) {
                throw new Error('Subtitle is not displayed in the comparison block with the index ' + index);
            }
            const text = await rows[1].$(selectors.text);
            await text.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await text.getText();
        } catch (err) {
            await this.handleError('PublishReport modal dialog, subtitle block', 'err_publish_report_date_subtitle', err);
        }
    }

    // Returns the date in the subtitle of the comparison block
    async getDateInSubtitleOfComparisonBlock(index) {
        try {
            const rows = await this.getTextAndDateRowsInBlock(index);
            if (rows.length < 2) {
                throw new Error('Subtitle is not displayed in the comparison block with the index ' + index);
            }
            const date = await rows[1].$(selectors.date);
            await date.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await date.getText();
        } catch (err) {
            await this.handleError('PublishReport modal dialog, date in the subtitle block', 'err_publish_report_date_subtitle', err);
        }
    }

    // Returns the text in all TextAndDate rows of the dialog: headers, subtitles and 'offline after' rows
    async getAllComparisonsBlockHeader() {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$(`${selectors.body} ${selectors.textAndDateRow} ${selectors.text}`);
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            const texts = [];
            for (const el of elements) {
                texts.push(await el.getText());
            }
            return texts;
        } catch (err) {
            await this.handleError('PublishReport modal dialog, text in TextAndDate rows', 'err_publish_report_dlg_header', err);
        }
    }

    // Returns the date in all TextAndDate rows of the dialog: headers, subtitles and 'offline after' rows
    async getAllComparisonsDate() {
        try {
            const host = await this.getShadowHost();
            const elements = await host.shadow$$(`${selectors.body} ${selectors.textAndDateRow} ${selectors.date}`);
            await elements[0].waitForDisplayed({timeout: appConst.mediumTimeout});
            const texts = [];
            for (const el of elements) {
                texts.push(await el.getText());
            }
            return texts;
        } catch (err) {
            await this.handleError('PublishReport modal dialog, date in TextAndDate rows', 'err_publish_report_dlg_date', err);
        }
    }

    // Text in the 'Item went offline after' rows, these rows are displayed above and below the comparison blocks
    async getOfflineAfterMessages() {
        const host = await this.getShadowHost();
        const rows = await host.shadow$$(selectors.offlineRow);
        const texts = [];
        for (const row of rows) {
            texts.push(await row.getText());
        }
        return texts;
    }

    // 'No published versions' or 'Content was offline in the selected period' message, it is displayed instead of the comparison blocks
    async getNoComparisonsMessage() {
        const host = await this.getShadowHost();
        const message = await host.shadow$(selectors.noComparisonsMessage);
        await message.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await message.getText();
    }

    async waitForPrintButtonDisplayed() {
        try {
            const host = await this.getShadowHost();
            const button = await host.shadow$(selectors.printButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            await this.handleError(`PublishReport modal dialog - 'Print' button should be displayed`, 'err_publish_report_print_btn', err);
        }
    }

    // The button is disabled with the 'aria-disabled' attribute, so 'isEnabled()' can not be used here
    async waitForPrintButtonEnabled() {
        try {
            const host = await this.getShadowHost();
            const button = await host.shadow$(selectors.printButton);
            await button.waitForDisplayed({timeout: appConst.mediumTimeout});
            return await this.getBrowser().waitUntil(async () => {
                return await button.getAttribute('aria-disabled') !== 'true';
            }, {timeout: appConst.mediumTimeout, timeoutMsg: `'Print' button should be enabled`});
        } catch (err) {
            await this.handleError(`PublishReport modal dialog - 'Print' button should be enabled`, 'err_publish_report_print_btn', err);
        }
    }

    // 'Show entire content' checkbox is displayed only in blocks where two versions are compared
    async waitForShowEntireContentCheckboxNotDisplayed() {
        const host = await this.getShadowHost();
        return await this.getBrowser().waitUntil(async () => {
            const checkboxes = await host.shadow$$(selectors.showEntireContentCheckbox);
            return checkboxes.length === 0;
        }, {
            timeout: appConst.mediumTimeout,
            timeoutMsg: `'Show entire content' checkbox should not be displayed in the modal dialog`
        });
    }

    async waitForShowEntireContentCheckboxDisplayed() {
        const host = await this.getShadowHost();
        const label = await host.shadow$(selectors.showEntireContentCheckboxLabel);
        return await label.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async clickOnShowEntireContentCheckbox(index) {
        const host = await this.getShadowHost();
        const labels = await host.shadow$$(selectors.showEntireContentCheckboxLabel);
        if (index >= labels.length) {
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        await labels[index].waitForDisplayed({timeout: appConst.mediumTimeout});
        return await labels[index].click();
    }

    async isShowEntireContentCheckboxSelected(index) {
        const host = await this.getShadowHost();
        const checkboxes = await host.shadow$$(selectors.showEntireContentCheckbox);
        if (index >= checkboxes.length) {
            throw new Error('Publish report modal dialog, the number of checkboxes less then expected');
        }
        await checkboxes[index].waitForExist({timeout: appConst.mediumTimeout});
        return await checkboxes[index].isSelected();
    }
}

module.exports = PublishReportDialog;
