/**
 * Created on 01.12.2021
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const ArchiveItemStatisticsPanel = require('../page_objects/archive/archive.item.statistics.panel');
const ConfirmValueDialog = require('../page_objects/confirm.content.delete.dialog');
const ArchiveDeleteDialog = require('../page_objects/archive/archive.delete.dialog');
const ArchiveContentWidgetItemView = require('../page_objects/archive/archive.widget.item.view');
const ArchivedContentStatusWidget = require('../page_objects/archive/archived.content.status.widget');
const ArchiveBrowseContextPanel = require('../page_objects/archive/archive.browse.context.panel');
const ArchivedContentVersionsWidget = require('../page_objects/archive/archived.content.versions.widget');
const CompareContentVersionsDialog = require('../page_objects/compare.content.versions.dialog');

describe('archive.browse.panel.spec: tests for archive browse panel and selection controller', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

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

    it(`WHEN checkbox in a row has been clicked THEN SelectionPanelToggler gets visible`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            // 1. Select and archive two folders:
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
            await contentBrowsePanel.rightClickOnItemByDisplayName(FOLDER2.displayName);
            await contentBrowsePanel.clickOnMenuItem(appConst.GRID_CONTEXT_MENU.ARCHIVE);
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot('folder_to_archive2');
            await deleteContentDialog.clickOnArchiveButton();
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(2);
            await confirmValueDialog.clickOnConfirmButton();
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            // 2. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            // 3. Click on the checkbox:
            await archiveBrowsePanel.clickCheckboxAndSelectRowByDisplayName(FOLDER1.displayName);
            await studioUtils.saveScreenshot('archive_selection_controller1');
            await archiveBrowsePanel.clickOnSelectionToggler();
            // 4. Verify that just one item are displayed in the filtered grid:
            let displayNames = await archiveBrowsePanel.getDisplayNamesInGrid();
            assert.equal(displayNames.length, 1, 'Single item should be present in the filtered grid');
            // 5. Verify that checkboxes are clickable: Unselect one item in the filtered grid:
            await archiveBrowsePanel.clickOnCheckboxByName(FOLDER1.displayName);
            await archiveBrowsePanel.pause(2000);
            await studioUtils.saveScreenshot('grid_returned_to_initial_state');
            // 6. Verify that the selection toggler(circle in the toolbar) gets not visible :
            await archiveBrowsePanel.waitForSelectionTogglerNotVisible();
            // 7. Verify that Grid returns to the initial state:
            displayNames = await archiveBrowsePanel.getDisplayNamesInGrid();
            assert.ok(displayNames.length > 1, 'Initial state of Grid is restored');
            let result = await archiveBrowsePanel.isSelectionControllerSelected();
            assert.ok(result === false, 'Selection Controller checkBox should not be selected');
        });

    it("WHEN Selection Controller checkbox is selected (All items are checked) THEN 'Delete..' 'Restore...' buttons should be enabled",
        async () => {
            // 1. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 2. 'Selection Controller' checkbox is selected (All items are checked):
            await archiveBrowsePanel.clickOnSelectionControllerCheckbox();
            // 3. Verify buttons:
            await archiveBrowsePanel.waitForDeleteButtonEnabled();
            await archiveBrowsePanel.waitForRestoreButtonEnabled();
        });

    // Verify https://github.com/enonic/app-contentstudio-plus/issues/316
    // Workflow state should not be displayed in Archive #316
    it("WHEN a folder has been selected THEN expected path and status should be displayed in the Item Statistics panel",
        async () => {
            await studioUtils.openArchivePanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            let contentWidgetItemView = new ArchiveContentWidgetItemView();
            // 1. Navigate to 'Archive Browse Panel' and click on the checkbox for the archived content:
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER1.displayName);
            // 2. Verify status of the content:
            let status = await archiveItemStatisticsPanel.getStatus();
            assert.equal(status, 'Archived', "Archived status should be displayed in Item Statistics panel");
            // 3. Verify that workflow icon is not displayed:
            await contentWidgetItemView.waitForWorkflowStateNotDisplayed();
            // 4. Verify the name in the content widget:
            let actualDisplayName = await contentWidgetItemView.getContentDisplayName();
            assert.equal(actualDisplayName, FOLDER1.displayName, "Expected content name should be displayed on thr panel");
        });

    it("GIVEN a folder is selected WHEN the folder has been unselected THEN Item Statistics panel should be cleared",
        async () => {
            // 1. Navigate to 'Archive Browse Panel' and click on a checkbox of a archived folder:
            await studioUtils.openArchivePanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archiveItemStatisticsPanel = new ArchiveItemStatisticsPanel();
            // 1. Click on the row and select an item:
            await archiveBrowsePanel.clickOnRowByDisplayName(FOLDER1.displayName);
            // 2. Verify status of the content:
            let status = await archiveItemStatisticsPanel.getStatus();
            assert.equal(status, 'Archived', "Archived status should be displayed in Item Statistics panel");
            // 3. Click on the row and unselect the item
            await archiveBrowsePanel.clickOnRowByDisplayName(FOLDER1.displayName);
            // 4. Verify that Item Statistics panel is cleared:
            await archiveItemStatisticsPanel.waitForContentStatusNotDisplayed();
            await archiveItemStatisticsPanel.waitForPreviewWidgetDropdownNotDisplayed();
        });

    it("WHEN existing folder is selected THEN 'Archived' status should be displayed in Details Panel",
        async () => {
            let archivedContentStatusWidget = new ArchivedContentStatusWidget();
            // 1. Navigate to 'Archive Browse Panel' and click on a checkbox of a archived folder:
            await studioUtils.openArchivePanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let contentWidgetItemView = new ArchiveContentWidgetItemView();
            // 2. Click on the row and select an item:
            await archiveBrowsePanel.clickOnRowByDisplayName(FOLDER1.displayName);
            // 3. Verify the Archived status of the content:
            let actualStatus = await archivedContentStatusWidget.getStatus();
            assert.equal(actualStatus, 'Archived', "Expected status should be displayed in Details Panel");
        });

    it("GIVEN existing folder is selected AND 'Versions widget' is opened WHEN 'Show changes' button in Edited item has been clicked THEN compareContentVersionsDialog should be loaded",
        async () => {
            let archiveBrowseContextPanel = new ArchiveBrowseContextPanel()
            let archivedContentVersionsWidget = new ArchivedContentVersionsWidget();
            let compareContentVersionsDialog = new CompareContentVersionsDialog();
            // 1. Navigate to 'Archive Browse Panel' and click on a checkbox of a archived folder:
            await studioUtils.openArchivePanel();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Click on the row and select an item:
            await archiveBrowsePanel.clickOnRowByDisplayName(FOLDER1.displayName);
            // 2. Open Versions widget:
            await archiveBrowseContextPanel.openVersionHistory();
            // 3. Click on 'Show changes' button:
            await archivedContentVersionsWidget.clickOnShowChangesButtonByHeader('Edited', 0);
            // 4. The modal dialog should be loaded:
            await compareContentVersionsDialog.waitForDialogOpened();
            // 5. Click on Left dropdown handle:
            await compareContentVersionsDialog.clickOnLeftDropdownHandle();
            await studioUtils.saveScreenshot('compare_versions_dlg_archived_options');
            // 6. Verify that option with 'Archived' icon should be present in the dropdown list:
            let result = await compareContentVersionsDialog.getArchivedOptionsInDropdownList()
            assert.equal(result.length, 1, "One item with 'archived-icon' should be present in the selector options");
        });

    it(`GIVEN 2 folders are selected AND selection controller has been clicked WHEN both folders have been deleted THEN selection controller(circle) gets not visible`,
        async () => {
            let archiveDeleteDialog = new ArchiveDeleteDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            // 1. Navigate to 'Archive Browse Panel':
            await studioUtils.openArchivePanel();
            // 2. Select two folders
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER1.displayName);
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER2.displayName);
            // 3. Click on Delete... button in the browse toolbar
            await archiveBrowsePanel.clickOnDeleteButton();
            await archiveDeleteDialog.waitForOpened();
            // 4. Click on 'Delete' button in the modal dialog:
            await archiveDeleteDialog.clickOnDeleteButton();
            await confirmValueDialog.waitForDialogOpened();
            // 5. Confirm the value:
            await confirmValueDialog.typeNumberOrName(2);
            await confirmValueDialog.clickOnConfirmButton();
            await archiveDeleteDialog.waitForClosed();
            // 6. Verify that both folders are removed from Archive-grid
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            await archiveBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            // 7. Verify that selection controller(circle) gets not visible in the toolbar:
            await studioUtils.saveScreenshot('archive_selection_controller_not_visible');
            await archiveBrowsePanel.waitForSelectionTogglerNotVisible();
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
