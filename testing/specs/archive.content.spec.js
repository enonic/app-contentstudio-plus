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

describe('archive.content.spec:  tests for archiving content', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let FOLDER1;

    it(`Precondition: new folder should be added`,
        async () => {
            let displayName = appConst.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(displayName);
            await studioUtils.doAddFolder(FOLDER1);
        });

    it(`GIVEN existing folders is checked checked AND 'Delete Content Dialog' is opened WHEN the folder hase been archived THEN the folders should be present only in the Archive Grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let deleteContentDialog = new DeleteContentDialog();
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            //1. Select a folder
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            //2. Click on 'Archive...' button in Content Browse Panel toolbar:
            await contentBrowsePanel.clickOnArchiveButton();
            await deleteContentDialog.waitForDialogOpened();
            await studioUtils.saveScreenshot("folder_to_archive");
            //3. Click on 'Archive' button in the modal dialog:
            await deleteContentDialog.clickOnArchiveButton();
            //4. Verify that the content is not displayed in Content Browse Panel:
            await contentBrowsePanel.waitForContentNotDisplayed(FOLDER1.displayName);
            let message = await contentBrowsePanel.waitForNotificationMessage();
            let expectedMessage = appConst.itemIsArchived(FOLDER1.displayName);
            assert.equal(message, expectedMessage, "Expected notification message should appear");
            //5. Navigate to 'Archive Browse Panel' and check the archived content:
            await studioUtils.openArchivePanel();
            await studioUtils.saveScreenshot("folder_in_archive");
            await archiveBrowsePanel.waitForContentDisplayed(FOLDER1.displayName);
        });


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
