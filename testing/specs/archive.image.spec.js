/**
 * Created on 22.01.2025
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

describe('archive.image.spec: tests for PreviewWidgetDropdown', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const TEST_IMAGE = appConst.TEST_IMAGES.KOTEY;

    it(`GIVEN existing image is checked checked AND 'Archive Content Dialog' is opened WHEN the image has been archived THEN the image should be present only in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Select an image
            await studioUtils.findAndSelectItemByDisplayName(TEST_IMAGE);
            // 2. Click on 'Archive...' button in Content Browse toolbar:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot('image_to_archive1');
            // 3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            // 4. Verify that the image is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(TEST_IMAGE);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(TEST_IMAGE);
            assert.equal(message, expectedMessage, 'Expected notification message should appear');
            // 5. Navigate to 'Archive Browse Panel' and check the archived image:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot('image_in_archive');
            await archiveBrowsePanel.waitForContentDisplayed(TEST_IMAGE);
        });


    it(`WHEN existing archived image is selected THEN 'Automatic' option should be selected in Preview Panel`,
        async () => {
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(TEST_IMAGE);
            await studioUtils.saveScreenshot('archive_image_selected');
            await archiveItemStatisticsPanel.waitForPreviewWidgetDropdownDisplayed();
            await studioUtils.saveScreenshot('archive_image_selected_2');
            let actualOption = await archiveItemStatisticsPanel.getSelectedOptionInPreviewWidget();

            assert.equal(actualOption, appConst.PREVIEW_WIDGET.AUTOMATIC,
                'Automatic option should be selected in preview widget by default');
        });

    it(`GIVEN existing archived image is selected AND 'Restore...' context menu item has been clicked WHEN Archive button has been pressed in the modal dialog THEN the image should be present only in the Content Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            // 2. Do 'rightClick' on the folder and Click on 'Restore...' menu item in the Context menu
            await archiveBrowsePanel.rightClickOnItemByDisplayName(TEST_IMAGE);
            await studioUtils.saveScreenshot('context-menu-restore');
            await archiveBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.RESTORE);
            await archiveRestoreDialog.waitForOpened();
            await studioUtils.saveScreenshot('img_to_restore1');
            // 3. Click on 'Restore' button in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            // 4. Verify that the content is not displayed in Archive Browse Panel:
            let message = await contentBrowsePanel.waitForNotificationMessage();
            await archiveBrowsePanel.waitForContentNotDisplayed(TEST_IMAGE);
            // 5. Verify the content is present in Content Browse Panel
            await studioUtils.switchToContentMode();
            await studioUtils.saveScreenshot('image_is_restored');
            await studioUtils.findContentAndClickCheckBox(TEST_IMAGE);
        });


    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
