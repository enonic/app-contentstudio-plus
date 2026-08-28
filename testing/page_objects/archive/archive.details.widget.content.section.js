/**
 * Created on 07.12.2021 updated on 28.08.2026
 */
const Page = require('../page');

const xpath = {
    container: `//section[@data-component='ArchiveDetailsWidgetContentSection']`,
    valueByLabel: label => `//div[child::dt[text()='${label}']]/dd`,
};

const LABELS = {
    STATUS: 'Status',
    DISPLAY_NAME: 'Display Name',
    ORIGINAL_PATH: 'Original path',
};

class ArchiveDetailsWidgetContentSection extends Page {

    get status() {
        return xpath.container + xpath.valueByLabel(LABELS.STATUS);
    }

    get contentDisplayName() {
        return xpath.container + xpath.valueByLabel(LABELS.DISPLAY_NAME);
    }

    get originalPath() {
        return xpath.container + xpath.valueByLabel(LABELS.ORIGINAL_PATH);
    }

    async getStatus() {
        try {
            await this.waitForElementDisplayed(this.status);
            return await this.getText(this.status);
        } catch (err) {
            await this.handleError('Archive Details Widget, get the Status value. ', 'err_archive_details_widget_status', err);
        }
    }

    // The 'Display Name' item is not rendered when the content has no display name
    async getContentDisplayName() {
        try {
            await this.waitForElementDisplayed(this.contentDisplayName);
            return await this.getText(this.contentDisplayName);
        } catch (err) {
            await this.handleError('Archive Details Widget, get the Display Name value. ', 'err_archive_details_widget_display_name',
                err);
        }
    }

    // The path is truncated in the UI, so the full value is taken from the 'title' attribute
    async getOriginalPath() {
        try {
            await this.waitForElementDisplayed(this.originalPath);
            return await this.getAttribute(this.originalPath, 'title');
        } catch (err) {
            await this.handleError('Archive Details Widget, get the Original path value. ', 'err_archive_details_widget_original_path',
                err);
        }
    }
}

module.exports = ArchiveDetailsWidgetContentSection;
