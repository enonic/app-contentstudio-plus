/**
 * Created on 10.07.2025
 */
const BaseContextWindowPanel = require('../../details_panel/base.context.window.panel');
const {DROPDOWN} = require('../../../libs/elements');
const appConst = require('../../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ArchiveBrowsePanel')]//div[contains(@id,'DockedContextPanel')]`,
};

//  ArchiveBrowsePanel, ContextView:
class ArchiveContextWindowPanel extends BaseContextWindowPanel {

    get container() {
        return xpath.container;
    }

    get widgetSelectorDropdownHandle() {
        return xpath.container + DROPDOWN.WIDGET_COMBOBOX + "//button[@aria-label='Toggle']";
    }

    get widgetSelectorDropdown() {
        return xpath.container + DROPDOWN.WIDGET_COMBOBOX;
    }

    async waitForOpened() {
        try {
            return await this.waitForElementDisplayed(xpath.container + "//div[contains(@id,'ContextView')]", appConst.shortTimeout);
        } catch (err) {
            await this.handleError('Archive Context Window Panel was not loaded', 'err_archive_context_panel_loaded', err);
        }
    }

}

module.exports = ArchiveContextWindowPanel;

