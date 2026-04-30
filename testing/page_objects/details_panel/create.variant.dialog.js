/**
 * Created  on 01.04.2023
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const selectors = {
    container: 'div[id*="CreateVariantDialog"]',
    variantNameInput: 'div[id*="VariantNameInput"] input[type="text"]',
    cancelButtonTop: 'div.cancel-button-top',
    validationStatus: 'div.status.invalid',
};

class CreateVariantDialog extends Page {

    async findCreateVariantButton() {
        const host = await this.getWidgetShadowHost();
        const buttons = await host.shadow$$('button[id*="DialogButton"]');
        for (const btn of buttons) {
            const text = await btn.getText();
            if (text.includes('Create Variant')) {
                return btn;
            }
        }
        throw new Error('Create Variant button not found in the dialog');
    }

    async typeTextInVariantNameInput(text) {
        const host = await this.getWidgetShadowHost();
        const input = await host.shadow$(selectors.variantNameInput);
        await input.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await input.setValue(text);
    }

    async waitForCreateVariantButtonEnabled() {
        const button = await this.findCreateVariantButton();
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await button.waitForEnabled({timeout: appConst.mediumTimeout});
    }

    async waitForCreateVariantButtonDisabled() {
        const button = await this.findCreateVariantButton();
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await button.waitForEnabled({timeout: appConst.mediumTimeout, reverse: true});
    }

    async waitForValidationPathMessageDisplayed() {
        const host = await this.getWidgetShadowHost();
        const div = await host.shadow$(selectors.validationStatus);
        await div.waitForDisplayed({timeout: appConst.mediumTimeout});
        return await div.getText();
    }

    async clickOnCreateVariantButton() {
        const button = await this.findCreateVariantButton();
        await button.waitForDisplayed({timeout: appConst.mediumTimeout});
        await button.waitForEnabled({timeout: appConst.mediumTimeout});
        return await button.click();
    }

    async clickOnCancelButtonTop() {
        const host = await this.getWidgetShadowHost();
        const button = await host.shadow$(selectors.cancelButtonTop);
        await button.waitForDisplayed({timeout: appConst.shortTimeout});
        await button.click();
        return await this.waitForDialogClosed();
    }

    async waitForDialogLoaded() {
        try {
            const host = await this.getWidgetShadowHost();
            const dialog = await host.shadow$(selectors.container);
            await dialog.waitForDisplayed({timeout: appConst.mediumTimeout});
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_variants_dlg');
            throw new Error(`Create Variant Dialog is not loaded ${screenshot} ` + err);
        }
    }

    async waitForDialogClosed() {
        try {
            const host = await this.getWidgetShadowHost();
            const dialog = await host.shadow$(selectors.container);
            return await dialog.waitForDisplayed({timeout: appConst.shortTimeout, reverse: true});
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_variants_dlg');
            throw new Error(`Create Variant Dialog is not closed ${screenshot} ` + err);
        }
    }
}

module.exports = CreateVariantDialog;
