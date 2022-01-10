/**
 * Created on 02.12.2021
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

describe('archive.muiltiselect.restore.spec: tests for restore several items', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let FOLDER1;
    let FOLDER2;
    const FOLDER_DISPLAY_NAME = appConst.TEST_FOLDER_WITH_IMAGES_2;
    const FOLDER_NAME = appConst.TEST_FOLDER_WITH_IMAGES_NAME_2;

    it(`Precondition: new folders should be added`,
        async () => {
            let displayName1 = appConst.generateRandomName('folder');
            let displayName2 = appConst.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(displayName1);
            FOLDER2 = contentBuilder.buildFolder(displayName2);
            await studioUtils.doAddFolder(FOLDER1);
            await studioUtils.doAddFolder(FOLDER2);
        });

    it(`GIVEN 2 folders are selected WHEN Archive button has been pressed in Delete/Archive modal dialog THEN Confirm Archive dialog should appear`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            //1. Select two folders
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
            //2. Click on 'Archive...' menu item in the Context menu
            await contentBrowsePanel.rightClickOnItemByDisplayName(FOLDER2.displayName);
            await contentBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.ARCHIVE);
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot("folder_to_archive2");
            //3. Click on 'Archive' button in Archive/Delete modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            //4. Verify that 'Confirm Archive' dialog is loaded:
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(2);
            //5. Confirm the archiving:
            await confirmValueDialog.clickOnConfirmButton();
            //6. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            //7. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot("folder_in_archive2");
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER2.displayName);
        });

    //Verifies issue https://github.com/enonic/app-contentstudio-plus/issues/311
    //Confirm restore dialog - the modal dialog should be closed after click on Cancel button or Esc #311
    it(`GIVEN 2 folders are selected in Archive AND Confirm Value dialog has been opened WHEN 'Cancel' button has been pressed THEN modal dialog should be closed`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            //1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            //2. Select two folders
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER1.displayName);
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER2.displayName);
            //3. Click on Restore... button in the browse toolbar
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            //4. Click on Restore in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            await confirmValueDialog.waitForDialogOpened();
            //5. Click on Cancel button in the modal dialog:
            await confirmValueDialog.clickOnCancelButton();
            //6. Verify that both dialogs are closed:
            await confirmValueDialog.waitForDialogClosed();
            await archiveRestoreDialog.waitForClosed();
        });

    //Verifies issue https://github.com/enonic/app-contentstudio-plus/issues/311
    //Confirm restore dialog - the modal dialog should be closed after click on Cancel button or Esc #311
    it(`GIVEN 2 folders are selected in Archive AND Confirm Value dialog has been opened WHEN 'Esc' key has been pressed THEN modal dialog should be closed`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            //1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            //2. Select two folders
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER1.displayName);
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER2.displayName);
            //3. Click on Restore... button in the browse toolbar
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            //4. Click on Restore in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            await confirmValueDialog.waitForDialogOpened();
            //5. Press the ESC key
            await confirmValueDialog.pressEscKey();
            //6. Verify that both dialogs are closed:
            await confirmValueDialog.waitForDialogClosed();
            await archiveRestoreDialog.waitForClosed();
        });

    it(`GIVEN 2 folders are selected in Archive AND 'Confirm Value' dialog has been opened WHEN the restoring has been confirmed THEN both folders should not be present in Archive`,
        async () => {
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            //1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            //2. Select two folders
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER1.displayName);
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER2.displayName);
            //3. Click on Restore... button in the browse toolbar
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            //4. Click on Restore in the modal dialog:
            await archiveRestoreDialog.clickOnRestoreButton();
            await confirmValueDialog.waitForDialogOpened();
            //5. Confirm the value:
            await confirmValueDialog.typeNumberOrName(2);
            await confirmValueDialog.clickOnConfirmButton();
            await archiveRestoreDialog.waitForClosed();
            //6. Verify that both folders are removed from Archive-grid
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
        });

    // Verify https://github.com/enonic/app-contentstudio-plus/issues/346
    //Error after restoring filtered content #346
    it(`GIVEN existing archived folder with children items is filtered WHEN the folder has been restored THEN 'Hide Selection' circle gets not visible`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            //1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER_DISPLAY_NAME);
            //2. Archive this folder with children:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await deleteContentDialog.clickOnArchiveButton();
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(11);
            await confirmValueDialog.clickOnConfirmButton();
            //3. Navigate to 'Archive Browse Panel' and select the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot("folder_in_archive1_2");
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER_NAME);
            //4. Click on 'Show Selection' circle:
            await archiveBrowsePanel.clickOnSelectionToggler();
            //5. Open 'Restore from Archive' dialog:
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            await archiveRestoreDialog.clickOnRestoreButton();
            //5. Confirm the value:
            await confirmValueDialog.typeNumberOrName(11);
            await confirmValueDialog.clickOnConfirmButton();
            await archiveRestoreDialog.waitForClosed();
            //7. Verify that selection controller(circle) gets not visible in the toolbar:
            await studioUtils.saveScreenshot("archive_selection_controller_not_visible_2");
            await archiveBrowsePanel.waitForSelectionTogglerNotVisible();
        });


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
