/**
 * Created on 17.11.2021
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const ArchiveRestoreDialog = require('../page_objects/archive/archive.restore.dialog');
const ArchiveDeleteDialog = require('../page_objects/archive/archive.delete.dialog');
const ArchiveBrowseContextPanel = require('../page_objects/archive/archive.browse.context.panel');
const ArchivedContentVersionsWidget = require('../page_objects/archive/archived.content.versions.widget');

describe('archive.content.spec: tests for archiving content', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    let FOLDER1;
    let FOLDER2;
    const ARCHIVE_DELETE_TITLE = 'Delete from Archive';
    const ARCHIVE_RESTORE_TITLE = 'Restore from Archive';
    const TEST_ARCHIVE_LOG_MSG = 'test';

    it(`Precondition: new folder should be added`,
        async () => {
            let displayName1 = appConst.generateRandomName('folder');
            let displayName2 = appConst.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(displayName1);
            FOLDER2 = contentBuilder.buildFolder(displayName2);
            await studioUtils.doAddFolder(FOLDER1);
            await studioUtils.doAddFolder(FOLDER2);
        });

    it(`GIVEN existing folder is checked checked AND 'Delete Content Dialog' is opened WHEN the folder has been archived THEN the folders should be present only in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            // 2. Click on 'Archive...' button in Content Browse toolbar:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot('folder_to_archive1');
            await deleteContentDialog.clickOnLogMessageLinkAndShowInput();
            // Insert Archive message:
            await deleteContentDialog.typeTextInArchiveMessageInput(TEST_ARCHIVE_LOG_MSG);
            // 3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            // 4. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(FOLDER1.displayName);
            assert.equal(message, expectedMessage, 'Expected notification message should appear');
            // 5. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot('folder_in_archive1');
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER1.displayName);
            let result = await archiveBrowsePanel.getDisplayNamesInGrid();
            const hasDuplicates = new Set(result).size !== result.length;
            assert.ok(hasDuplicates === false, 'There should be no duplicates in the Archive Grid');
        });

    it(`GIVEN existing folder is checked AND 'Archive...' context menu item has been clicked WHEN Archive button has been pressed in the modal dialog THEN the folder should be present only in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
            // 2. Click on 'Archive...' menu item in the Context menu
            await contentBrowsePanel.rightClickOnItemByDisplayName(FOLDER2.displayName);
            await studioUtils.saveScreenshot('context-menu-archive');
            await contentBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.ARCHIVE);
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot('folder_to_archive2');
            // 3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            // 4. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(FOLDER2.displayName);
            assert.equal(message, expectedMessage, 'Expected notification message should appear');
            // 5. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot('folder_in_archive2');
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER2.displayName);
        });

    it(`GIVEN existing archived folder is selected AND 'Restore...' context menu item has been clicked WHEN Archive button has been pressed in the modal dialog THEN the folder should be present only in the Content Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            // 2. Do 'rightClick' on the folder and Click on 'Restore...' menu item in the Context menu
            await archiveBrowsePanel.rightClickOnItemByDisplayName(FOLDER2.displayName);
            await studioUtils.saveScreenshot('context-menu-restore');
            await archiveBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.RESTORE);
            await archiveRestoreDialog.waitForOpened();
            let actualTitle = await archiveRestoreDialog.getTitleInHeader();
            assert.equal(actualTitle, ARCHIVE_RESTORE_TITLE, "Expected title should be displayed in the dialog");
            await studioUtils.saveScreenshot('folder_to_restore1');
            // 3. Click on 'Restore' button in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            // 4. Verify that the content is not displayed in Archive Browse Panel:
            let message = await contentBrowsePanel.waitForNotificationMessage();
            await studioUtils.saveScreenshot('folder_to_restore_notification');
            let expectedMessage = appConst.itemIsRestored(FOLDER2.displayName);
            assert.equal(message, expectedMessage, 'Expected notification message should appear');
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            // 5. Verify the content is present in Content Browse Panel
            await studioUtils.switchToContentMode();
            await studioUtils.saveScreenshot('folder_is_restored');
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
        });

    // Enable providing a message when archiving content #8878
    it(`GIVEN existing archived folder is selected WHEN 'Versions Widget' has been opened THEN the log message should be displayed in the archived-item in the Versions Widget`,
        async () => {
            let archiveDeleteDialog = new ArchiveDeleteDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archiveBrowseContextPanel = new ArchiveBrowseContextPanel()
            let archivedContentVersionsWidget = new ArchivedContentVersionsWidget();
            // 1. Go to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            await archiveBrowsePanel.openContextWindowPanel();
            // 2. Open Versions widget:
            await archiveBrowseContextPanel.openVersionHistory();
            await studioUtils.saveScreenshot('archived_message_versions_widget');
            // 3. Verify that the archive message is displayed in the archived item in the Versions Widget:
            let result = await archivedContentVersionsWidget.getLogMessageFromArchivedItems();
            assert.strictEqual(result[0], TEST_ARCHIVE_LOG_MSG, 'Expected log message should be displayed in the archived item in the Versions Widget');
        });

    it(`GIVEN existing archived folder is selected WHEN 'Delete Archive Dialog' button has been opened THEN expected title and items should be displayed on the dialog`,
        async () => {
            let archiveDeleteDialog = new ArchiveDeleteDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' :
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            // 2. Do 'rightClick' on the folder and Click on 'Delete...' menu item in the Context menu
            await archiveBrowsePanel.rightClickOnItemByDisplayName(FOLDER1.displayName);
            await studioUtils.saveScreenshot('context-menu-delete');
            await archiveBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.DELETE);
            await archiveDeleteDialog.waitForOpened();
            await studioUtils.saveScreenshot('delete_archive_dialog');
            // 3. 'Delete' button and expected title should be displayed in the dialog:
            await archiveDeleteDialog.waitForDeleteButtonDisplayed();
            let title = await archiveDeleteDialog.getTitleInHeader();
            assert.equal(title, ARCHIVE_DELETE_TITLE, 'Expected title should be present in the dialog');
            let actualItems = await archiveDeleteDialog.getItemsToDeleteDisplayName();
            assert.equal(actualItems[0], FOLDER1.displayName, "Expected item to delete should be displayed");
        });

    // Verifies https://github.com/enonic/app-contentstudio-plus/issues/300
    // Notification message should appear after deleting content from Archive #300
    it(`GIVEN existing archived folder is selected AND 'Delete...' context menu item has been clicked WHEN 'Delete' button has been pressed in the modal dialog THEN the folder should be removed from Archive`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveDeleteDialog = new ArchiveDeleteDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Navigate to 'Archive Browse Panel' and check the archived folder:
            await studioUtils.openArchivePanel();
            // 2. Do 'rightClick' on the folder and Click on 'Delete...' menu item in the Context menu
            await archiveBrowsePanel.rightClickOnItemByDisplayName(FOLDER1.displayName);
            await studioUtils.saveScreenshot('context-menu-delete');
            await archiveBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.DELETE);
            await archiveDeleteDialog.waitForOpened();
            await studioUtils.saveScreenshot('folder_to_delete');
            // 3. Click on 'Delete' button in the modal dialog:
            await archiveDeleteDialog.clickOnDeleteButton();
            // 4. Verify that the content is not displayed in Archive Browse Panel:
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            // 5. Verify the notification message
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsDeleted(FOLDER1.displayName);
            assert.equal(message, expectedMessage, 'Expected notification message should appear');
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
