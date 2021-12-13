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
            let confirmValueDialog = new ConfirmValueDialog();
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

            //4. Verify the status widget
            let actualStatus = await archivedContentStatusWidget.getStatus();
            assert.equal(actualStatus, "Archived", "Expected status should be displayed");
        });

    it(`GIVEN archived content has been selected WHEN widget dropdown handle has been clicked THEN 2 expected options should be in WidgetSelector dropdown`,
        async () => {
            let archiveBrowseContextPanel = new ArchiveBrowseContextPanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            //3. Click on Widget Selector dropdown handler:
            await archiveBrowseContextPanel.clickOnWidgetSelectorDropdownHandle();
            //4. Verify that two options are present in the selector:
            let actualOptions = await archiveBrowseContextPanel.getWidgetSelectorDropdownOptions();
            assert.isTrue(actualOptions.includes('Details'));
            assert.isTrue(actualOptions.includes('Version history'));
            assert.equal(actualOptions.length, 2, "Two options should be in the selector");
        });

    it(`GIVEN archived content has been selected WHEN 'Versions widget' has been opened THEN expected Archived version item should be displayed in the widget`,
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
            //5. Verify that new 'Restored' version-item appears in the widget:
            let actualUser = await browseVersionsWidget.getRestoredBy(0);
            assert.equal(actualUser, "by Super User", "Expected user should be displayed in the 'restored by'");
            //6. Verify the status in the restored content
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
