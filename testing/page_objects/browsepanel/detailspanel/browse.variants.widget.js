/**
 * Created on 20.02.2023
 */
const BaseVariantsWidget = require('../../details_panel/base.variants.widget');

const xpath = {
    widget: "//div[contains(@id,'ContentBrowsePanel')]//div[contains(@id,'VariantsWidget') and contains(@class,'widget-variants')]",
};

class BrowseVariantsWidget extends BaseVariantsWidget {

    get variantsWidget() {
        return xpath.widget;
    }

    get widgetItemView() {
        return xpath.widgetItemView;
    }
}

module.exports = BrowseVariantsWidget;

