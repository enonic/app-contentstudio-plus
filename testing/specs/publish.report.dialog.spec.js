/**
 * Created on 27.11.2023
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const PublishReportDialog = require('../page_objects/publish.report.dialog');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require('../libs/content.builder');
const ContentWizardPanel = require('../page_objects/wizardpanel/content.wizard.panel');
const WizardPublishReportWidget = require('../page_objects/wizardpanel/details/wizard.publish.report.widget');
const ContentPublishDialog = require('../page_objects/content.publish.dialog');
const ContentUnpublishDialog = require('../page_objects/content.unpublish.dialog');

describe('publish.report.dialog.spec: tests for publish report dialog', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // set up the standalone mode if WDIO-mode is not used:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let FOLDER1;
    const ITEM_OFFLINE_TEXT = 'Item went offline';
    const ITEM_ONLINE_TEXT = 'Item went online';
    const ITEM_REPUBLISHED_HEADER = 'Comparing';
    const ITEM_REPUBLISHED_SUBTITLE = 'NB: Item was offline from';
    const CURRENT_DATE = new Date().toJSON().slice(0, 10);

    it(`Precondition: new folder should be added`,
        async () => {
            let displayName1 = appConst.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(displayName1);
            await studioUtils.doAddReadyFolder(FOLDER1);
        });

    it(`GIVEN existing folder has been published in the wizard WHEN  'Generate' button has been pressed in 'Publish report' widget THEN publish report modal dialog should appear`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            let contentPublishDialog = new ContentPublishDialog();
            let publishReportDialog = new PublishReportDialog();
            // 1. Select and open the folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            await contentWizard.clickOnPublishButton();
            await contentPublishDialog.waitForDialogOpened();
            await contentPublishDialog.clickOnPublishNowButton();
            await contentWizard.waitForNotificationMessage();
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 3. Click on 'Generate' button:
            await wizardPublishReportWidget.clickOnGenerateButton();
            await studioUtils.saveScreenshot('publish_report_print_button');
            // 4. Verify that 'Print' button is displayed:
            await publishReportDialog.waitForDialogLoaded();
            await publishReportDialog.waitForPrintButtonEnabled();
            // 5. 'Show entire content' checkbox should not be displayed:
            await publishReportDialog.waitForShowEntireContentCheckboxNotDisplayed();
            // 6. Verify the 'Item went online' in the header of the single comparison block:
            let actualText = await publishReportDialog.getHeaderInComparisonBlock(0);
            assert.equal(actualText, ITEM_ONLINE_TEXT, `'Item went online' - this text should be displayed in the single comparison block`);
        });

    it(`GIVEN existing folder has been unpublished in the wizard WHEN 'Publish report' modal dialog has been opened THEN 'Item went offline' text should appear`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            let unpublishDialog = new ContentUnpublishDialog();
            let publishReportDialog = new PublishReportDialog();
            // 1. Select and open the folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            // 2. Click on Unpublish button:
            await contentWizard.clickOnUnpublishButton();
            await unpublishDialog.waitForDialogOpened();
            await unpublishDialog.clickOnUnpublishButton();
            await unpublishDialog.waitForDialogClosed();
            await contentWizard.waitForNotificationMessage();
            // 3. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 4. Click on 'Generate' button:
            await wizardPublishReportWidget.clickOnGenerateButton();
            await studioUtils.saveScreenshot('publish_report_generate_button');
            await publishReportDialog.waitForDialogLoaded();
            // 5. Verify that the Comparisons-block with 'Item went offline' text gets visible in the modal dialog:
            let actualText = await publishReportDialog.getAllComparisonsBlockHeader();
            assert.equal(actualText, ITEM_OFFLINE_TEXT, `'Item went offline' should be displayed in the modal dialog`);
            // 6. Verify the date in the 'Item went offline' block:
            let actualDate = await publishReportDialog.getAllComparisonsDate();
            assert.ok(actualDate.includes(CURRENT_DATE), 'Current date should be displayed in the text and date block');
            // 7. Verify  that the comparison block remains visible -  'Item went online' text should be in the header of the single comparison block
            actualText = await publishReportDialog.getHeaderInComparisonBlock(0);
            assert.equal(actualText, ITEM_ONLINE_TEXT, 'Item went online - this text should be displayed in the comparison block');
        });

    it(`GIVEN existing folder has been published in the second time WHEN 'Publish report' modal dialog has been opened THEN 'Comparing' text should appear in the modal dialog`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let wizardPublishReportWidget = new WizardPublishReportWidget();
            let contentPublishDialog = new ContentPublishDialog();
            let publishReportDialog = new PublishReportDialog();
            // 1. Select and open the folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            // 2. Click on 'Publish' button then re-publish the content again:
            await contentWizard.clickOnPublishButton();
            await contentPublishDialog.waitForDialogOpened();
            await contentPublishDialog.clickOnPublishNowButton();
            await contentWizard.waitForNotificationMessage();
            // 3. Open 'Publish Report' widget:
            await contentWizard.openPublishReportWidget();
            await wizardPublishReportWidget.waitForWidgetLoaded();
            // 4. Open 'Publish Report' modal dialog:
            await wizardPublishReportWidget.clickOnGenerateButton();
            await publishReportDialog.waitForDialogLoaded();
            // 5. Verify 'Comparing' text in the header of the single comparison block:
            let actualText = await publishReportDialog.getHeaderInComparisonBlock(0);
            assert.equal(actualText, ITEM_REPUBLISHED_HEADER, `'Comparing' - this text should be displayed in the single comparison block`);
            let actualDate = await publishReportDialog.getDateInHeaderOfComparisonBlock(0);
            assert.ok(actualDate.includes(CURRENT_DATE), 'Current date should be displayed in the text and date block');
            // 6. Verify the text in the subtitle of the single comparison block - 'NB: Item was offline from'
            let subTitle = await publishReportDialog.getSubtitleInComparisonBlock(0);
            assert.equal(subTitle, ITEM_REPUBLISHED_SUBTITLE,
                `'NB: Item was offline from' - should be displayed in the subtitle of the comparison block`);
            // 7. Verify that 'Show entire content' checkbox is displayed and not selected:
            let isSelected = await publishReportDialog.isShowEntireContentCheckboxSelected(0);
            assert.ok(isSelected === false, `'Show entire content' checkbox should not be selected`);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
