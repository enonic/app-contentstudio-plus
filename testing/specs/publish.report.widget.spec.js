/**
 * Created on 20.11.2023
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");

const ContentWizardPanel = require('../page_objects/wizardpanel/content.wizard.panel');
const WizardPublishReportWidget = require('../page_objects/wizardpanel/details/wizard.publish.report.widget');
const ContentPublishDialog = require('../page_objects/content.publish.dialog');

describe('publish.report.widget.spec: tests for publish report widget', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // set up the standalone mode if WDIO-mode is not used:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let FOLDER1;
    const CURRENT_DATE = new Date().toJSON().slice(0, 10);
    const DATE_IN_FUTURE = '2050-11-27';
    const INVALID_DATE = '2050-111-27';
    const DATE_IN_PAST = '2010-11-27';

    it(`Precondition: new folder should be added`,
        async () => {
            let displayName1 = appConst.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(displayName1);
            await studioUtils.doAddReadyFolder(FOLDER1);
        });

    it(`GIVEN existing New-folder has been opened WHEN 'Publish report' widget has been opened THEN 'Generate' button should not be displayed`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            // 1. Select and open the folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            await studioUtils.saveScreenshot('publish_report_gen');
            // 3. Verify that 'Generate' button should not be displayed:
            await wizardPublishReportWidget.waitForGenerateButtonNotDisplayed();
            // 4. Verify that 'From' and 'to' date pickers are not displayed:
            await wizardPublishReportWidget.waitForToDateInputNotDisplayed();
            await wizardPublishReportWidget.waitForFromDateInputNotDisplayed();
        });

    it(`GIVEN existing folder has been published in the wizard WHEN 'Publish report' widget has been opened THEN 'Generate' button should be enabled`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            let contentPublishDialog = new ContentPublishDialog();
            // 1. Select and open the folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            await contentWizard.clickOnPublishButton();
            await contentPublishDialog.waitForDialogOpened();
            await contentPublishDialog.clickOnPublishNowButton();
            await contentWizard.waitForNotificationMessage();
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 3. Verify that 'Generate' button is displayed:
            await wizardPublishReportWidget.waitForGenerateButtonEnabled();
            // 4. Verify that 'From' and 'to' date pickers are displayed:
            await wizardPublishReportWidget.waitForToDateInputDisplayed();
            await wizardPublishReportWidget.waitForFromDateInputDisplayed();
            // 5. Expected date should be displayed in the both date inputs:
            let actualFromDate = await wizardPublishReportWidget.getDateInFromInput();
            assert.equal(actualFromDate, CURRENT_DATE, "Expected date should be in From-input");
            let actualToDate = await wizardPublishReportWidget.getDateInToInput();
            assert.equal(actualToDate, CURRENT_DATE, "Expected date should be in To-input");
        });

    it(`GIVEN 'Publish report' widget has been opened WHEN a date in future has been typed in the 'From' input THEN 'Generate' button gets disabled`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            // 1. Select and open the existing published folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 3. Enter a date in the future:
            await wizardPublishReportWidget.typeInFromDateInput(DATE_IN_FUTURE)
            // 4. Verify that 'Generate' button gets disabled:
            await wizardPublishReportWidget.waitForGenerateButtonDisabled();
            // 5. Expected validation message should appear:
            let actualMessage = await wizardPublishReportWidget.getValidationMessage();
            assert.equal(actualMessage, 'Start date must be before end date', "Expected validation message should appears in the widget");
        });

    it(`GIVEN 'Publish report' widget has been opened WHEN invalid date has been typed in the 'From' input THEN 'Generate' button gets disabled`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            // 1. Select and open the existing published folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 3. Enter an invalid date in the future:
            await wizardPublishReportWidget.typeInFromDateInput(INVALID_DATE);
            // 4. Verify that 'Generate' button gets disabled:
            await wizardPublishReportWidget.waitForGenerateButtonDisabled();
            // 5. Expected validation message should appear:
            let actualMessage = await wizardPublishReportWidget.getValidationMessage();
            assert.equal(actualMessage, 'Invalid date', "Expected validation message should appears in the widget");
        });

    it(`GIVEN 'Publish report' widget has been opened WHEN date in the past has been typed in the 'From' input THEN 'Generate' button gets disabled`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            // 1. Select and open the existing published folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 3. Enter an invalid date in the future:
            await wizardPublishReportWidget.typeInFromDateInput(DATE_IN_PAST);
            await studioUtils.saveScreenshot('publish_report_generate_disabled');
            // 4. Verify that 'Generate' button gets disabled:
            await wizardPublishReportWidget.waitForGenerateButtonDisabled();
            // 5. Expected validation message should appear:
            let actualMessage = await wizardPublishReportWidget.getValidationMessage();
            assert.ok(actualMessage.includes('There were no publications before'),
                "Expected validation message should appears in the widget");
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
