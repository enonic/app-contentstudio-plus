/**
 * Created on 12.09.2025
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");
const DeleteContentDialog = require('../page_objects/delete.content.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');

describe('archive.content.check.duplicates.spec: tests for archiving content', function () {
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

    // https://github.com/enonic/app-contentstudio-plus/issues/1665
    // Duplicated items in Archive #1665
    it(`WHEN existing 2 folder has been archived THEN there should be no duplicates in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            // 1. Select the first folder and move it to archive:
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await deleteContentDialog.clickOnArchiveButton();
            // 2. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            await contentBrowsePanel.waitForNotificationMessage();
            // 3. Navigate to 'Archive Browse Panel' and check for duplicates in the grid:
            await studioUtils.openArchivePanel();
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER1.displayName);
            let result = await archiveBrowsePanel.getDisplayNamesInGrid();
            const hasDuplicates = new Set(result).size !== result.length;
            assert.ok(hasDuplicates === false, 'There should be no duplicates in the Archive Grid');
            // 4. Switch to Content mode and move to archive the second folder:
            await studioUtils.switchToContentMode();
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await deleteContentDialog.clickOnArchiveButton();
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER2.displayName);
            await contentBrowsePanel.waitForNotificationMessage();
            // 5. Navigate to 'Archive Browse Panel' and check for duplicates in the grid:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot('archive_issue_duplicates');
            let items = await archiveBrowsePanel.getDisplayNamesInGrid();
            const hasDuplicates2 = new Set(items).size !== items.length;
            assert.ok(hasDuplicates2 === false, 'There should be no duplicates in the Archive Grid');
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
