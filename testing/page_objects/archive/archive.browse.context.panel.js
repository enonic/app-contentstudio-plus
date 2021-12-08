/**
 * Created on 07.07.2021
 */
const BaseDetailsPanel = require('../details_panel/base.details.panel');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ArchiveBrowsePanel')]//div[contains(@id,'DockedContextPanel')]`,
    widgetSelectorDropdown: `//div[contains(@id,'WidgetSelectorDropdown')]`,
};

class ArchiveBrowseContextPanel extends BaseDetailsPanel {

    get widgetSelectorDropdownHandle() {
        return xpath.container + xpath.widgetSelectorDropdown + lib.DROP_DOWN_HANDLE;
    }

    get widgetSelectorDropdown() {
        return xpath.container + xpath.widgetSelectorDropdown;
    }

    waitForContextPanelLoaded() {
        return this.waitForElementDisplayed(xpath.container, appConst.shortTimeout).catch(err => {
            throw new Error('Context Panel was not loaded in ' + err);
        });
    }

    waitForContextPanelCleared() {
        let selector = xpath.container + "//div[contains(@id,'ContextView')]";
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('no-selection');
            })
        }, {timeout: appConst.shortTimeout, timeoutMsg: "Context Panel should be cleared"});
    }
}

module.exports = ArchiveBrowseContextPanel;

