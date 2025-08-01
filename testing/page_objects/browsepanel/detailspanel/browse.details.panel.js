/**
 * Created on 04/07/2018.
 */
const BaseDetailsPanel = require('../../details_panel/base.details.panel');
const lib = require('../../../libs/elements');
const appConst = require('../../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ContentBrowsePanel')]//div[contains(@id,'DockedContextPanel')]`,
};

//  ContentBrowsePanel, ContextView:
class BrowseDetailsPanel extends BaseDetailsPanel {

    get widgetSelectorDropdownHandle() {
        return xpath.container + lib.DROPDOWN_SELECTOR.WIDGET_FILTER_DROPDOWN + lib.DROP_DOWN_HANDLE;
    }

    get widgetSelectorDropdown() {
        return xpath.container + lib.DROPDOWN_SELECTOR.WIDGET_FILTER_DROPDOWN;
    }

    waitForDetailsPanelLoaded() {
        return this.waitForElementDisplayed(xpath.container, appConst.shortTimeout).catch(err => {
            throw new Error('Details Panel was not loaded in ' + err);
        });
    }

    waitForDetailsPanelCleared() {
        let selector = xpath.container + "//div[contains(@id,'ContextView')]";
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(selector, 'class').then(result => {
                return result.includes('no-selection');
            })
        }, {timeout: appConst.shortTimeout, timeoutMsg: "Details Panel should be cleared"});
    }

    async waitForWidgetDropdownRoleAttribute(expectedValue) {
        let locator = this.widgetSelectorDropdownHandle;
        await this.waitForAttributeValue(locator, appConst.ACCESSIBILITY_ATTRIBUTES.ROLE, expectedValue);
    }
}

module.exports = BrowseDetailsPanel;

