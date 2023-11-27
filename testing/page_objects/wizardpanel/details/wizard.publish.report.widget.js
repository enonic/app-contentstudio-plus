/**
 * Created on 02.11.2023
 */
const BasePublishReportWidget = require('../../details_panel/base.publish.report.widget');

const xpath = {
    widget: "//div[contains(@id,'ContentWizardPanel')]//div[contains(@id,'PublishReportWidget')]",
};

class WizardPublishReportWidget extends BasePublishReportWidget {

    get publishReportWidget() {
        return xpath.widget;
    }
}

module.exports = WizardPublishReportWidget;

