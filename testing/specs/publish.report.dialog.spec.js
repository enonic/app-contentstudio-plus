/**
 * Created on 27.11.2023 updated on 27.08.2026
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const PublishReportDialog = require('../page_objects/publish.report.dialog');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require('../libs/content.builder');
const ContentWizardPanel = require('../page_objects/wizardpanel/content.wizard.panel');
const PublishReportWidget = require('../page_objects/details_panel/publish.report.widget');
const ContentPublishDialog = require('../page_objects/content.publish.dialog');
const ContentUnpublishDialog = require('../page_objects/content.unpublish.dialog');

describe('publish.report.dialog.spec: tests for publish report dialog', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // set up the standalone mode if WDIO-mode is not used:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let FOLDER1;
    //const IMPORTED_FOLDER_NAME = 'test-data';
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

    it(`GIVEN existing folder has been published in the wizard WHEN 'Generate' button has been pressed in 'Publish report' widget THEN publish report modal dialog should appear`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let publishReportWidget = new PublishReportWidget();
            let contentPublishDialog = new ContentPublishDialog();
            let publishReportDialog = new PublishReportDialog();
            // 1. Select and open the folder:
            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            await contentWizard.clickOnPublishButton();
            await contentPublishDialog.waitForDialogOpened();
            await contentPublishDialog.clickOnPublishNowButton();
            await contentWizard.waitForNotificationMessage();
            // 2. Open 'Publish Report' widget:
            await contentWizard.openPublishingReportWidget();
            await publishReportWidget.waitForWidgetLoaded();
            // 3. Click on 'Generate' button:
            await publishReportWidget.clickOnGenerateButton();
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
            let publishReportWidget = new PublishReportWidget();
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
            await contentWizard.openPublishingReportWidget();
            await publishReportWidget.waitForWidgetLoaded();
            // 4. Click on 'Generate' button:
            await publishReportWidget.clickOnGenerateButton();
            await publishReportDialog.waitForDialogLoaded();
            // 5. Verify that the 'Item went offline' row is displayed above the comparison block:
            let offlineRows = await publishReportDialog.getOfflineAfterMessages();
            assert.equal(offlineRows.length, 1, `A single 'Item went offline' row should be displayed in the modal dialog`);
            assert.ok(offlineRows[0].includes(ITEM_OFFLINE_TEXT), `'Item went offline' should be displayed in the modal dialog`);
            // 6. Verify the date in the 'Item went offline' row, it is the first TextAndDate row in the dialog:
            let actualDate = await publishReportDialog.getAllComparisonsDate();
            assert.ok(actualDate[0].includes(CURRENT_DATE), 'Current date should be displayed in the text and date block');
            // 7. Verify that the single comparison block remains visible with 'Item went online' text in its header:
            let numberOfBlocks = await publishReportDialog.getNumberOfComparisonBlocks();
            assert.equal(numberOfBlocks, 1, 'A single comparison block should be displayed in the modal dialog');
            let actualText = await publishReportDialog.getHeaderInComparisonBlock(0);
            assert.equal(actualText, ITEM_ONLINE_TEXT, 'Item went online - this text should be displayed in the comparison block');
        });

    it(`GIVEN previously unpublished folder has been published again WHEN 'Publish report' modal dialog has been opened THEN single block with 'Comparing' header and 'NB: Item was offline from' subtitle should be displayed`,
        async () => {
            let contentWizard = new ContentWizardPanel();
            let publishReportWidget = new PublishReportWidget();
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
            await contentWizard.openPublishingReportWidget();
            await publishReportWidget.waitForWidgetLoaded();
            // 4. Open 'Publish Report' modal dialog:
            await publishReportWidget.clickOnGenerateButton();
            await publishReportDialog.waitForDialogLoaded();
            // 5. Two publishes are in the period, so a single block compares the first published version with the second one:
            let numberOfBlocks = await publishReportDialog.getNumberOfComparisonBlocks();
            assert.equal(numberOfBlocks, 1, 'A single comparison block should be displayed in the modal dialog');
            let headerText = await publishReportDialog.getHeaderRowTextInComparisonBlock(0);
            assert.ok(headerText.startsWith(ITEM_REPUBLISHED_HEADER),
                `'Comparing' - the header of the comparison block should start with this text, actual: '${headerText}'`);
            // Both dates in the header - the older and the newer publish - should be the current date:
            let headerDates = await publishReportDialog.getDatesInHeaderOfComparisonBlock(0);
            assert.equal(headerDates.length, 2, `Two dates should be displayed in the 'Comparing' header`);
            assert.ok(headerDates.every(date => date.includes(CURRENT_DATE)), 'Current date should be displayed in both dates of the header');
            assert.notEqual(headerDates[0], headerDates[1], 'The dates of the compared versions should be different');
            // 6. The unpublish happened between the two publishes, so it is displayed in the subtitle of the block, not as a separate row:
            let subTitle = await publishReportDialog.getSubtitleInComparisonBlock(0);
            assert.equal(subTitle, ITEM_REPUBLISHED_SUBTITLE,
                `'NB: Item was offline from' - should be displayed in the subtitle of the comparison block`);
            let subTitleDate = await publishReportDialog.getDateInSubtitleOfComparisonBlock(0);
            assert.ok(subTitleDate.includes(CURRENT_DATE), 'Current date should be displayed in the subtitle of the comparison block');
            let offlineRows = await publishReportDialog.getOfflineAfterMessages();
            assert.equal(offlineRows.length, 0, `'Item went offline' rows should not be displayed outside of the comparison block`);
            // 7. Verify that 'Show entire content' checkbox is displayed and not selected:
            let isSelected = await publishReportDialog.isShowEntireContentCheckboxSelected(0);
            assert.ok(isSelected === false, `'Show entire content' checkbox should not be selected`);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioApp();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndNavigateToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
