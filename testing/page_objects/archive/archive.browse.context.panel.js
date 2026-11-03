/**
 * Created on 07.07.2021
 */
const BaseDetailsPanel = require('../details_panel/base.context.window.panel');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ArchiveBrowsePanel')]//div[@data-component='ContextPanelView']`,
};

class ArchiveBrowseContextPanel extends BaseDetailsPanel {

    get container() {
        return xpath.container;
    }
    get widgetSelectorDropdownHandle() {
        return xpath.container + lib.DROPDOWN_SELECTOR.WIDGET_FILTER_DROPDOWN + lib.DROP_DOWN_HANDLE;
    }

    get widgetSelectorDropdown() {
        return xpath.container + lib.DROPDOWN_SELECTOR.WIDGET_FILTER_DROPDOWN;
    }

    waitForContextPanelLoaded() {
        return this.waitForElementDisplayed(xpath.container, appConst.shortTimeout).catch(err => {
            throw new Error('Context Panel was not loaded in ' + err);
        });
    }

    async waitForContextPanelCleared() {
        try {
            let selector = xpath.container + "//div[@data-component='PreviewLabel']";
            await this.waitForElementDisplayed(selector, appConst.shortTimeout);
        } catch (err) {
            await this.handleError('Context Panel should be cleared', 'err_archive_context_panel_cleared', err);
        }
    }
}

module.exports = ArchiveBrowseContextPanel;

