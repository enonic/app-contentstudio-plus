/**
 * Created on 10.07.2025
 */
const BaseDetailsPanel = require('../../details_panel/base.context.window.panel');
const lib = require('../../../libs/elements');
const appConst = require('../../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ArchiveBrowsePanel')]//div[contains(@id,'DockedContextPanel')]`,
};

//  ArchiveBrowsePanel, ContextView:
class ArchiveContextWindowPanel extends BaseDetailsPanel {

    get widgetSelectorDropdownHandle() {
        return xpath.container + lib.DROPDOWN_SELECTOR.WIDGET_FILTER_DROPDOWN + lib.DROP_DOWN_HANDLE;
    }

    get widgetSelectorDropdown() {
        return xpath.container + lib.DROPDOWN_SELECTOR.WIDGET_FILTER_DROPDOWN;
    }

    async waitForDetailsPanelLoaded() {
        try {
            return await this.waitForElementDisplayed(xpath.container, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Archive Context Panel was not loaded', 'err_archive_context_panel_loaded', err);
        }
    }

    waitForDetailsPanelCleared() {
        let selector = xpath.container + "//div[contains(@id,'ContextView')]";
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('no-selection');
            })
        }, {timeout: appConst.shortTimeout, timeoutMsg: "Details Panel should be cleared"});
    }

}

module.exports = ArchiveContextWindowPanel;

