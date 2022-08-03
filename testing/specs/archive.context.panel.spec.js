/**
 * Created on 07.12.2021
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
const ArchivedContentPropertiesWidget = require('../page_objects/archive/archived.content.properties.widget');
const ArchivedContentStatusWidget = require('../page_objects/archive/archived.content.status.widget');
const ArchiveBrowseContextPanel = require('../page_objects/archive/archive.browse.context.panel');
const ArchivedContentVersionsWidget = require('../page_objects/archive/archived.content.versions.widget');
const ContentBrowseDetailsPanel = require('../page_objects/browsepanel/detailspanel/browse.details.panel');
const BrowseVersionsWidget = require('../page_objects/browsepanel/detailspanel/browse.versions.widget');
const ArchiveRestoreDialog = require('../page_objects/archive/archive.restore.dialog');
const CompareContentVersionsDialog = require('../page_objects/details_panel/compare.content.versions.dialog');

describe('archive.context.panel.spec: tests for archive context panel', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let FOLDER1;

    it(`Precondition: new folder should be added`,
        async () => {
            let displayName1 = appConst.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(displayName1);
            await studioUtils.doAddFolder(FOLDER1);
        });

    it(`WHEN archived content has been selected THEN expected properties should be displayed in widgets`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            //1. Select and archive the folder
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            await contentBrowsePanel.rightClickOnItemByDisplayName(FOLDER1.displayName);
            await contentBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.ARCHIVE);
            await deleteContentDialog.waitForDialogOpened();
            await deleteContentDialog.clickOnArchiveButton();
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            //2. Navigate to 'Archive Browse Panel' and select the archived content:
            await studioUtils.openArchivePanel();
            let archivedContentPropertiesWidget = new ArchivedContentPropertiesWidget();
            let archivedContentStatusWidget = new ArchivedContentStatusWidget();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            await studioUtils.saveScreenshot("archive_context_panel");
            //3. Verify the properties widget
            let actualOwner = await archivedContentPropertiesWidget.getOwner();
                assert.equal(actualOwner, "su", "Expected owner should be displayed");
                let actualType = await archivedContentPropertiesWidget.getType();
                assert.equal(actualType, "folder", "Expected type should be displayed");
                let actualApplication = await archivedContentPropertiesWidget.getApplication();
                assert.equal(actualApplication, "base", "Expected application should be displayed");
                //4. Verify the status in the widget
                let actualStatus = await archivedContentStatusWidget.getStatus();
                assert.equal(actualStatus, "Archived", "Expected status should be displayed");
        });

        it(`GIVEN 'Versions widget' is opened WHEN 'Created' version item has been clicked THEN 'Revert' and 'Active versions' should not be displayed`,
            async () => {
                    let archiveBrowseContextPanel = new ArchiveBrowseContextPanel();
                    let archiveBrowsePanel = new ArchiveBrowsePanel();
                    let archivedContentVersionsWidget = new ArchivedContentVersionsWidget();
                    await studioUtils.openArchivePanel();
                    //1. Select the archived content
                    await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
                    //2. Open the versions widget and click on Created version item:
                    await archiveBrowseContextPanel.openVersionHistory();
                    await archivedContentVersionsWidget.clickOnVersionItemByHeader(appConst.VERSIONS_ITEM_HEADER.CREATED, 0);
                    await archivedContentVersionsWidget.pause(1000);
                    await studioUtils.saveScreenshot("version_item_clicked");
                    //3. Verify that 'Revert' and 'Active versions' buttons are not displayed in the widget:
                    let result = await archivedContentVersionsWidget.isRevertButtonDisplayed();
                    assert.isFalse(result, "'Revert' button should not be displayed in the widget");
                    result = await archivedContentVersionsWidget.isActiveVersionButtonDisplayed();
                    assert.isFalse(result, "'Active version' button should not be displayed in the widget");
                    //4. Verify that 'Compare with current version' buttons is displayed in Created and Edited items only:
                    let isDisplayed = await archivedContentVersionsWidget.isCompareWithCurrentVersionButtonDisplayed(
                        appConst.VERSIONS_ITEM_HEADER.CREATED,
                        0);
                    assert.isTrue(isDisplayed, "'Compare with current version' button should be displayed in Created-item");
                    isDisplayed =
                        await archivedContentVersionsWidget.isCompareWithCurrentVersionButtonDisplayed(appConst.VERSIONS_ITEM_HEADER.EDITED,
                            0);
                    assert.isTrue(isDisplayed, "'Compare with current version' button should be displayed in the Edited-item");

                    isDisplayed =
                        await archivedContentVersionsWidget.isCompareWithCurrentVersionButtonDisplayed(
                            appConst.VERSIONS_ITEM_HEADER.ARCHIVED, 0);
                    assert.isFalse(isDisplayed, "'Compare with current version' button should not be displayed in the Archived-item");
            });

        it(`GIVEN archived content has been selected WHEN widget dropdown handle has been clicked THEN 2 expected options should be in WidgetSelector dropdown`,
            async () => {
                    let archiveBrowseContextPanel = new ArchiveBrowseContextPanel();
                    let archiveBrowsePanel = new ArchiveBrowsePanel();
                    await studioUtils.openArchivePanel();
                    //1. Select existing folder:
                    await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
                    //2. Click on Widget Selector dropdown handler:
                    await archiveBrowseContextPanel.clickOnWidgetSelectorDropdownHandle();
            //3. Verify that two options are present in the selector:
            let actualOptions = await archiveBrowseContextPanel.getWidgetSelectorDropdownOptions();
            assert.isTrue(actualOptions.includes('Details'));
            assert.isTrue(actualOptions.includes('Version history'));
            assert.equal(actualOptions.length, 2, "Two options should be in the selector");
        });

    it(`GIVEN archived content has been selected WHEN Comparing Versions Dialog has been opened THEN Revert menu buttons should be hidden`,
        async () => {
            let archiveBrowseContextPanel = new ArchiveBrowseContextPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archivedContentVersionsWidget = new ArchivedContentVersionsWidget();
            let compareContentVersionsDialog = new CompareContentVersionsDialog();
            await studioUtils.openArchivePanel();
            //1. Select the archived content
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            //2. Open Versions Widget:
            await archiveBrowseContextPanel.openVersionHistory();
            //3. Open 'Compare Versions' modal dialog:
                await archivedContentVersionsWidget.clickOnCompareWithCurrentVersionButtonByHeader(appConst.VERSIONS_ITEM_HEADER.EDITED, 0);
                await compareContentVersionsDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot("compare_versions_dialog");
            //4. Verify that 'Left Revert' menu button is not displayed:
            await compareContentVersionsDialog.waitForLeftRevertMenuButtonNotDisplayed();
            //5. Verify that 'Right Revert' menu button is not displayed:
            await compareContentVersionsDialog.waitForRightRevertMenuButtonNotDisplayed();
        });

    //Verify - Archive app - error after clicking on a version item in Compare Versions modal dialog #445
    //https://github.com/enonic/app-contentstudio-plus/issues/445
    it(`GIVEN Comparing Versions Dialog has been opened WHEN left versions selector has been expanded AND previous option has been clicked THEN Versions are identical should be displayed in the dialog`,
        async () => {
            let archiveBrowseContextPanel = new ArchiveBrowseContextPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archivedContentVersionsWidget = new ArchivedContentVersionsWidget();
            let compareContentVersionsDialog = new CompareContentVersionsDialog();
            await studioUtils.openArchivePanel();
            //1. Select the archived content
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            //2. Open Versions Widget:
            await archiveBrowseContextPanel.openVersionHistory();
            //3. Open 'Compare Versions' modal dialog:
                await archivedContentVersionsWidget.clickOnCompareWithCurrentVersionButtonByHeader(appConst.VERSIONS_ITEM_HEADER.EDITED, 0);
                await compareContentVersionsDialog.waitForDialogOpened();
            //4. Click on the dropdown handle and expand the left menu:
            await compareContentVersionsDialog.clickOnLeftSelectorDropdownHandle();
            await studioUtils.saveScreenshot("compare_versions_dialog_left_expanded");
            //5. click on the 'Previous version' option in the expanded options:
            await compareContentVersionsDialog.clickOnOptionInLeftVersionsSelector("Previous version");
            await studioUtils.saveScreenshot("compare_versions_dialog_left_previous_version");
            //6. Verify that 'Versions are identical' message gets visible in the content panel:
            let message = await compareContentVersionsDialog.waitForContentPanelIsEmpty();
            assert.equal(message, "Versions are identical", "Expected message should be displayed in the dialog");
        });

        it(`GIVEN existing archived content has been selected WHEN 'Versions widget' has been opened THEN expected Archived version item should be displayed in the widget`,
            async () => {
                    let archiveBrowseContextPanel = new ArchiveBrowseContextPanel();
                    let archiveBrowsePanel = new ArchiveBrowsePanel();
                    let archivedContentVersionsWidget = new ArchivedContentVersionsWidget();
                    await studioUtils.openArchivePanel();
                    //1. Select the archived content
                    await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
                    //2. Open the versions widget:
                    await archiveBrowseContextPanel.openVersionHistory();
                    //3. Verify that 'archived' version item appears in the widget:
            let actualStatus = await archivedContentVersionsWidget.getStatusInArchivedItem(0);
            assert.isTrue(actualStatus.includes("Archived"));
            let archivedBy = await archivedContentVersionsWidget.getArchivedBy(0);
            assert.equal(archivedBy, "by Super User", "Expected user should be displayed");
        });

    it(`GIVEN restored content has been selected WHEN 'Versions widget' has been opened THEN expected Restored version item should be displayed in the widget`,
        async () => {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let contentBrowsePanel = new ContentBrowsePanel();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let contentBrowseDetailsPanel = new ContentBrowseDetailsPanel();
            let browseVersionsWidget = new BrowseVersionsWidget();
            await studioUtils.openArchivePanel();
            //1. Select the archived content
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            //2. Restore the content
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            await studioUtils.saveScreenshot("folder_to_restore1_3");
            await archiveRestoreDialog.clickOnRestoreButton();
            await contentBrowsePanel.waitForNotificationMessage();
            //3. Go to Content Browse Panel:
            await studioUtils.switchToContentMode();
            //4. Select the folder and open Versions History:
            await studioUtils.findAndSelectItem(FOLDER1.displayName);
            await contentBrowseDetailsPanel.openVersionHistory();
            await studioUtils.saveScreenshot("folder_restored_by");
            //5. Verify that new 'Restored' version-item appears in the widget:
            let actualUser = await browseVersionsWidget.getRestoredBy(0);
            assert.equal(actualUser, "by Super User", "Expected user should be displayed in the 'restored by'");
            //6. Verify that 'Archived' version item is present in the widget:
            actualUser = await browseVersionsWidget.getArchivedBy(0);
            assert.equal(actualUser, "by Super User", "Expected user should be displayed in the 'restored by'");
            //7. Verify the status in the restored content
            let status = await browseVersionsWidget.getContentStatus();
            //Verify the content's status in the top of Version Widget
            assert.equal(status, appConst.CONTENT_STATUS.NEW, "'New' status should be after the restoring this content");
        });


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
