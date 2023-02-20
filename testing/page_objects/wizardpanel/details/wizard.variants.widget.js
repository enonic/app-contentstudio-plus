/**
 * Created on 20.02.2023
 */
const BaseVariantsWidget = require('../../details_panel/base.variants.widget');

const xpath = {
    widget: "//div[contains(@id,'ContentWizardPanel')]//div[contains(@class,'widget-variants')]",
    variantsList: "//ul[contains(@class,'variants-widget-list')]",
};

class WizardVariantsWidget extends BaseVariantsWidget {

    get variantsWidget() {
        return xpath.widget;
    }

    get widgetItemView() {
        return xpath.widgetItemView;
    }
}

module.exports = WizardVariantsWidget;

