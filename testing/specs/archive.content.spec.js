/**
 * Created on 17.11.2021
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const ConfirmValueDialog = require('../page_objects/confirm.content.delete.dialog');
const ArchiveRestoreDialog = require('../page_objects/archive/archive.restore.dialog');

describe('archive.content.spec: tests for archiving content', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let FOLDER1;
    let FOLDER2;

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
            //1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            //2. Click on 'Archive...' button in Content Browse toolbar:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot("folder_to_archive1");
            //3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            //4. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(FOLDER1.displayName);
            assert.equal(message, expectedMessage, "Expected notification message should appear");
            //5. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot("folder_in_archive1");
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER1.displayName);
        });

    it(`GIVEN existing folder is checked AND 'Archive...' context menu item has been clicked WHEN Archive button has been pressed in the modal dialog THEN the folder should be present only in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            //1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
            //2. Click on 'Archive...' menu item in the Context menu
            await contentBrowsePanel.rightClickOnItemByDisplayName(FOLDER2.displayName);
            await studioUtils.saveScreenshot("context-menu-archive");
            await contentBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.ARCHIVE);
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot("folder_to_archive2");
            //3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            //4. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(FOLDER2.displayName);
            assert.equal(message, expectedMessage, "Expected notification message should appear");
            //5. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot("folder_in_archive2");
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER2.displayName);
        });

    it(`GIVEN existing archived folder is selected AND 'Restore...' context menu item has been clicked WHEN Archive button has been pressed in the modal dialog THEN the folder should be present only in the Content Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            //1. Navigate to 'Archive Browse Panel' and check the archived folder:
            await studioUtils.openArchivePanel();
            //2. Do 'rightClick' on the folder and Click on 'Restore...' menu item in the Context menu
            await archiveBrowsePanel.rightClickOnItemByDisplayName(FOLDER2.displayName);
            await studioUtils.saveScreenshot("context-menu-restore");
            await archiveBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.RESTORE);
            await archiveRestoreDialog.waitForOpened();
            await studioUtils.saveScreenshot("folder_to_restore1");
            //3. Click on 'Restore' button in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            //4. Verify that the content is not displayed in Archive Browse Panel:
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsRestored(FOLDER2.displayName);
            assert.equal(message, expectedMessage, "Expected notification message should appear");
            //5. Verify the content is present in Content Browse Panel
            await studioUtils.switchToContentMode();
            await studioUtils.saveScreenshot("folder_is_restored");
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
        });


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
