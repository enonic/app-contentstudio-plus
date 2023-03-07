/**
 * Created on 17.11.2021
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const ConfirmValueDialog = require('../page_objects/confirm.content.delete.dialog');
const ArchiveRestoreDialog = require('../page_objects/archive/archive.restore.dialog');
const ArchiveDeleteDialog = require('../page_objects/archive/archive.delete.dialog');

describe('archive.restore.content.dependant.items.spec: tests for archive/restore folder with children', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    const FOLDER_DISPLAY_NAME = appConst.TEST_FOLDER_2_DISPLAY_NAME;
    const FOLDER_NAME = appConst.TEST_FOLDER_2_NAME;

    const DEPENDENT_ITEM_NAME = "circles";


    it(`GIVEN existing folder is archived WHEN 'Delete from Archive' dialog is opened THEN expected dependent items should be present in the dialog`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            let archiveDeleteDialog = new ArchiveDeleteDialog();
            // 1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER_DISPLAY_NAME);
            // 2. Archive this folder with children:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await deleteContentDialog.clickOnArchiveButton();
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(12);
            await confirmValueDialog.clickOnConfirmButton();
            // 3. Verify the notification message:
            let message = await contentBrowsePanel.waitForNotificationMessage();
            assert.equal(message, '12 items are archived', 'Expected notification message should appear');

            // 4. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot('folder_in_archive1_1');
            // 5. Open 'Delete from Archive' dialog:
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER_NAME);
            await archiveBrowsePanel.clickOnDeleteButton();
            await archiveDeleteDialog.waitForOpened();
            // 6. Verify the dependent items
            let result = await archiveDeleteDialog.getChildItemsToDeletePath();
            assert.isTrue(result[0].includes(DEPENDENT_ITEM_NAME), 'Expected dependent items should be present in the dialog');
            assert.equal(result.length, 11, 'Expected number of dependent items should be present in the dialog');
        });

    it(`GIVEN existing folder is archived WHEN 'Restore from Archive' dialog is opened THEN expected dependent items should be present in the dialog`,
        async () => {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            let archiveRestoreDialog = new ArchiveRestoreDialog();

            // 1. Navigate to 'Archive Browse Panel' and select the archived content:
            await studioUtils.openArchivePanel();
            // 5. Open 'Restore from Archive' dialog:
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER_NAME);
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            // 6. Verify the dependent items
            let result = await archiveRestoreDialog.getChildItemsToRestorePath();
            assert.isTrue(result[0].includes(DEPENDENT_ITEM_NAME), "Expected dependent items should be present in the dialog");
            assert.equal(result.length, 11, "Expected number of dependent items should be present in the dialog");
            await archiveRestoreDialog.clickOnRestoreButton();
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(12);
            await confirmValueDialog.clickOnConfirmButton();
            let message = await archiveBrowsePanel.waitForNotificationMessage();
            assert.equal(message, "12 items are restored", "Expected notification message should appear");
            // 7. Verify the content is present in Content Browse Panel
            await studioUtils.switchToContentMode();
            await studioUtils.saveScreenshot("folder_is_restored_2");
            await studioUtils.findContentAndClickCheckBox(FOLDER_DISPLAY_NAME);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
