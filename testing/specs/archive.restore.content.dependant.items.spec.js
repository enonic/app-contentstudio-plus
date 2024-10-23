/**
 * Created on 17.11.2021
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const ConfirmValueDialog = require('../page_objects/confirm.content.delete.dialog');
const ArchiveRestoreDialog = require('../page_objects/archive/archive.restore.dialog');
const ArchiveDeleteDialog = require('../page_objects/archive/archive.delete.dialog');
const ArchiveFilterPanel = require('../page_objects/archive/archive.filter.panel');

describe('archive.restore.content.dependant.items.spec: tests for archive/restore folder with children', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    const FOLDER_DISPLAY_NAME = appConst.TEST_FOLDER_2_DISPLAY_NAME;
    const FOLDER_NAME = appConst.TEST_FOLDER_2_NAME;

    const DEPENDENT_ITEM_NAME = 'circles';
    const TEST_DISPLAY_NAME = 'presentation';

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
            assert.ok(result[0].includes(DEPENDENT_ITEM_NAME), 'Expected dependent items should be present in the dialog');
            assert.equal(result.length, 11, 'Expected number of dependent items should be present in the dialog');
        });

    it(`'Filter Panel' has been opened WHEN 'Executable' checkbox has been clicked THEN '4 hits' should be displayed in the panel`,
        async () => {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archiveFilterPanel = new ArchiveFilterPanel();
            // 1. Navigate to 'Archive Browse Panel' and open Filter Panel:
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickOnSearchButton();
            await archiveFilterPanel.waitForOpened();
            // 2. Verify the number in 'hits'
            let hitsCounter1 = await archiveFilterPanel.getTextInHitsCounter();
            await studioUtils.saveScreenshot('filter_panel_hits_counter1');
            assert.equal(hitsCounter1, '12 hits', 'Expected hits counter should be displayed');
            // 3. Click on 'Executable' checkbox:
            await archiveFilterPanel.clickOnCheckboxInContentTypesBlock('Executable');
            let result = await archiveBrowsePanel.getDisplayNamesInGrid();
            assert.equal(result.length, 4, 'Four items should be present in the grid');
            // 4. Verify that number in 'hits' is updated
            let hitsCounter2 = await archiveFilterPanel.getTextInHitsCounter();
            assert.equal(hitsCounter2, '4 hits', 'Expected hits counter should be displayed');
            // 5. Click on 'Clear' button:
            await archiveFilterPanel.clickOnClearButton();
            await archiveFilterPanel.waitForClearLinkNotDisplayed();
            let result2 = await archiveBrowsePanel.getDisplayNamesInGrid();
            assert.equal(result2.length, 1, 'Grid returns to the initial state');
            assert.equal(result2[0], FOLDER_DISPLAY_NAME, 'Expected item should be present in the grid');
        });

    it(`WHEN Filter Panel is opened THEN 'Archived', 'Archived By' aggregation groups should be present`,
        async () => {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archiveFilterPanel = new ArchiveFilterPanel();
            // 1. Navigate to 'Archive Browse Panel' and open Filter Panel:
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickOnSearchButton();
            await archiveFilterPanel.waitForOpened();
            // 2. Verify that Archived, Archived By aggregation groups are displayed:
            await archiveFilterPanel.waitForAggregationGroupDisplayed(appConst.FILTER_PANEL_AGGREGATION_BLOCK.ARCHIVED);
            await archiveFilterPanel.waitForAggregationGroupDisplayed(appConst.FILTER_PANEL_AGGREGATION_BLOCK.ARCHIVED_BY);
            // 3. The checkbox should not be selected by default:
            let isSelected = await archiveFilterPanel.isCheckboxSelected(appConst.FILTER_PANEL_AGGREGATION_BLOCK.ARCHIVED_BY, 'Me');
            assert.ok(isSelected === false, 'Archived By checkbox should not be selected');
            // 4. Click on 'Archived by' checkbox:
            await archiveFilterPanel.clickOnAggregationCheckbox(appConst.FILTER_PANEL_AGGREGATION_BLOCK.ARCHIVED_BY, 'Me');
            // 5. Verify that 'Archived by' checkbox is selected now:
            await studioUtils.saveScreenshot('archived_by_is_selected');
            isSelected = await archiveFilterPanel.isCheckboxSelected(appConst.FILTER_PANEL_AGGREGATION_BLOCK.ARCHIVED_BY, 'Me');
            assert.ok(isSelected, 'Archived By checkbox should be selected');
        });

    it(`GIVEN Filter Panel is opened WHEN content name has been typed in the search input THEN '1 hits' should appear in the filter panel`,
        async () => {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let archiveFilterPanel = new ArchiveFilterPanel();
            // 1. Navigate to 'Archive Browse Panel' and open Filter Panel:
            await studioUtils.openArchivePanel();
            // 2. Open Filter Panel:
            await archiveBrowsePanel.clickOnSearchButton();
            await archiveFilterPanel.waitForOpened();
            // 3. Insert the display name in the search text input:
            await archiveFilterPanel.typeSearchText(TEST_DISPLAY_NAME);
            await studioUtils.saveScreenshot('archive_filtered_by_name_grid');
            // 4. Verify the 'hits' number in the filtered grid
            let hitsCounter = await archiveFilterPanel.getTextInHitsCounter();
            assert.equal(hitsCounter, '1 hit', 'Expected hits counter should be displayed');
            // 5. Verify the item in the filtered grid
            let filteredItem = await archiveBrowsePanel.getDisplayNamesInGrid();
            assert.equal(filteredItem.length, 1, 'One item should be present in the filtered grid');
            assert.equal(filteredItem[0], TEST_DISPLAY_NAME, 'One item should be present in the filtered grid');
            // 6. Click on 'Clear' button:
            await archiveFilterPanel.clickOnClearButton();
            await studioUtils.saveScreenshot('filter_panel_clear_button_clicked');
            // 7. Verify that grid returns to the initial state:
            let result = await archiveBrowsePanel.getDisplayNamesInGrid();
            assert.equal(result.length, 1, 'One item should be present in the filtered grid');
            assert.equal(result[0], FOLDER_DISPLAY_NAME, 'Expected item should be present in the grid');
        });

    it(`GIVEN existing folder is archived WHEN 'Restore from Archive' dialog is opened THEN expected dependent items should be present in the dialog`,
        async () => {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            let archiveRestoreDialog = new ArchiveRestoreDialog();
            let archiveFilterPanel = new ArchiveFilterPanel();
            // 1. Navigate to 'Archive Browse Panel' and select the archived content:
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.clickOnSearchButton();
            await archiveFilterPanel.waitForOpened();
            // 2. Open 'Restore from Archive' dialog:
            await archiveBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER_NAME);
            await archiveBrowsePanel.clickOnRestoreButton();
            await archiveRestoreDialog.waitForOpened();
            // 3. Verify the dependent items
            let result = await archiveRestoreDialog.getChildItemsToRestorePath();
            assert.ok(result[0].includes(DEPENDENT_ITEM_NAME), "Expected dependent items should be present in the dialog");
            assert.equal(result.length, 11, "Expected number of dependent items should be present in the dialog");
            // 4. Click on 'Restore' button:
            await archiveRestoreDialog.clickOnRestoreButton();
            // 5. Confirm the number of items to restore:
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(12);
            await confirmValueDialog.clickOnConfirmButton();
            // 6. Verify the notification message
            let message = await archiveBrowsePanel.waitForNotificationMessage();
            await studioUtils.saveScreenshot('restore_confirmed');
            assert.equal(message, '12 items are restored', 'Expected notification message should appear');
            let hitsCounter = await archiveFilterPanel.getTextInHitsCounter();
            assert.equal(hitsCounter, '0 hits', 'Expected hits counter should be displayed');
            // 7. Verify - the content is present in Content Browse Panel
            await studioUtils.switchToContentMode();
            await studioUtils.saveScreenshot('folder_is_restored_2');
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
