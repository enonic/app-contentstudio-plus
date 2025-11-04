/**
 * Created on 31.10.2025
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const ArchiveItemStatisticsPanel = require('../page_objects/archive/archive.item.statistics.panel');
const ArchiveRestoreDialog = require('../page_objects/archive/archive.restore.dialog');

describe('archive.item.preview.for.text.content.spec: tests for archive item preview', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const IMPORTED_TEXT_CONTENT_NAME = 'test-text.txt';
    const IMPORTED_TEXT_CONTENT_DISPLAY_NAME = 'test-text';

    it(`WHEN the text content has been archived THEN the content should be present in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Select a text_content
            await studioUtils.findAndSelectItemByDisplayName(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            // 2. Click on 'Archive...' button in Content Browse toolbar:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot('text_content_to_archive1');
            // 3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            // 4. Verify that the image is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(IMPORTED_TEXT_CONTENT_NAME);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            assert.equal(message, expectedMessage, 'Expected notification message should appear');
            // 5. Navigate to 'Archive Browse Panel' and check the archived text-content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot('text_content_in_archive');
            await archiveBrowsePanel.waitForContentDisplayed(IMPORTED_TEXT_CONTENT_NAME);
        });

    it(`WHEN existing archived text-content is selected WHEN 'Automatic' is selected THEN 'Preview' button should be enabled and the expected text in the iframe in Preview Panel`,
        async () => {
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            // 2. Select the existing text content:
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            // 3. Verify that 'Automatic' option is selected in Preview Widget by default:
            await studioUtils.saveScreenshot('archived_text_content_selected');
            await archiveItemStatisticsPanel.waitForPreviewWidgetDropdownDisplayed();
            await archiveItemStatisticsPanel.pause(1000);
            await studioUtils.saveScreenshot('archived_text_content_selected_automatic');
            let actualOption = await archiveItemStatisticsPanel.getSelectedOptionInPreviewWidget();
            assert.equal(actualOption, appConst.PREVIEW_WIDGET.AUTOMATIC,
                'Automatic option should be selected in preview widget by default');
            // 4. Verify that 'Preview' button should be enabled when an image and 'Automatic' are selected
            await archiveItemStatisticsPanel.waitForPreviewButtonEnabled();
            // 5. Switch to the iframe and verify that the expected text is displayed in the iframe in Item Preview Panel:
            await archiveItemStatisticsPanel.switchToLiveViewFrame();
            let actualText = await archiveItemStatisticsPanel.getTextInAttachmentPreview();
            assert.ok(actualText.includes('Belarus'), 'expected text should be present in the Archive Preview Panel');
        });

    it(`GIVEN existing archived text-content is selected WHEN 'Json' is selected THEN 'Preview' button should be enabled`,
        async () => {
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            await archiveItemStatisticsPanel.selectOptionInPreviewWidget(appConst.PREVIEW_WIDGET.JSON);
            await studioUtils.saveScreenshot('archive_text_content_json');
            // 2. Click on 'Preview' button
            await archiveItemStatisticsPanel.clickOnPreviewButton();
            // 3. Switch to the new opened browser tab and verify that img element is displayed in the page:
            await studioUtils.doSwitchToNextTab();
            let actualName = await studioUtils.getJSON_info(appConst.PREVIEW_JSON_KEY.NAME);
            assert.equal(actualName, `"${IMPORTED_TEXT_CONTENT_NAME}"`, 'expected name should be displayed in JSON preview');
        });

    it(`GIVEN existing archived text content is selected WHEN 'Media' is selected THEN 'Preview' button should be enabled`,
        async () => {
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            await archiveItemStatisticsPanel.selectOptionInPreviewWidget(appConst.PREVIEW_WIDGET.MEDIA);
            await studioUtils.saveScreenshot('archived_text_media');
            // 2. Click on 'Preview' button
            await archiveItemStatisticsPanel.clickOnPreviewButton();
            // 3. Switch to the new opened browser tab and verify that expected text is displayed in the page:
            await studioUtils.doSwitchToNextTab();
            await studioUtils.waitForElementDisplayed(`//pre[contains(.,'Belarus')]`, appConst.mediumTimeout);
        });

    it(`GIVEN existing archived text content is selected WHEN 'Enonic Rendering' is selected THEN 'Preview' button should be disabled`,
        async () => {
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            await archiveItemStatisticsPanel.selectOptionInPreviewWidget(appConst.PREVIEW_WIDGET.ENONIC_RENDERING);
            await studioUtils.saveScreenshot('archive_image_rendering');
            // 2. Verify that 'Preview' button is disabled
            await archiveItemStatisticsPanel.waitForPreviewButtonDisabled();
        });

    it(`GIVEN existing archived text content is selected AND 'Restore...' context menu item has been clicked WHEN Archive button has been pressed in the modal dialog THEN the content should be present only in the Content Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            // 2. Do 'rightClick' on the folder and Click on 'Restore...' menu item in the Context menu
            await archiveBrowsePanel.rightClickOnItemByDisplayName(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
            await studioUtils.saveScreenshot('context-menu-restore');
            await archiveBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.RESTORE);
            await archiveRestoreDialog.waitForOpened();
            await studioUtils.saveScreenshot('text_content_to_restore1');
            // 3. Click on 'Restore' button in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            // 4. Verify that the content is not displayed in Archive Browse Panel:
            let message = await contentBrowsePanel.waitForNotificationMessage();
            await archiveBrowsePanel.waitForContentNotDisplayed(IMPORTED_TEXT_CONTENT_NAME);
            // 5. Verify the content is present in Content Browse Panel
            await studioUtils.switchToContentMode();
            await studioUtils.saveScreenshot('text_content_is_restored');
            await studioUtils.findContentAndClickCheckBox(IMPORTED_TEXT_CONTENT_DISPLAY_NAME);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
