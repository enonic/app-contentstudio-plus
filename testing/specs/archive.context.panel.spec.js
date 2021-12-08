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
            //4. Verify the status widget
            let actualStatus = await archivedContentStatusWidget.getStatus();
            assert.equal(actualStatus, "Archived", "Expected status status should be displayed");
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


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
