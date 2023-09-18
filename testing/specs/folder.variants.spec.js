/**
 * Created on 20.02.2023
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils.js');
const CreateVariantDialog = require('../page_objects/details_panel/create.variant.dialog');
const contentBuilder = require("../libs/content.builder");
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const appConst = require('../libs/app_const');
const DuplicateVariantDialog = require('../page_objects/details_panel/duplicate.variant.dialog');

describe('folder.variants.spec - tests for Create Variant modal dialog', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const NOT_AVAILABLE_MESSAGE = 'Not available';
    const FOLDER_NAME = studioUtils.generateRandomName('folder');
    const VARIANT_NAME_1 = appConst.generateRandomName('variant');


    it(`Precondition: new folder should be added`,
        async () => {
            let folder = contentBuilder.buildFolder(FOLDER_NAME);
            await studioUtils.doAddFolder(folder);
        });

    it("GIVEN 'create variant dialog' is opened WHEN variant name input has been cleared THEN 'Create Variant' button gets disabled",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseVariantsWidget = await studioUtils.openVariantsWidget();
            await browseVariantsWidget.waitForCreateVariantWidgetButtonDisplayed();
            // 2. Click on Create Variant button:
            await browseVariantsWidget.clickOnCreateVariantWidgetButton();
            await createVariantDialog.waitForDialogLoaded();
            // 3. Clear the name input in the modal dialog:
            await createVariantDialog.typeTextInVariantNameInput('');
            await studioUtils.saveScreenshot('variant_empty_name');
            // 4. Verify that 'Create Variant' is disabled in the dialog:
            await createVariantDialog.waitForCreateVariantButtonDisabled();
        });

    it("GIVEN variant's name has been typed WHEN 'Create Variant' button has been pressed THEN new variant should be added",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseVariantsWidget = await studioUtils.openVariantsWidget();
            await browseVariantsWidget.waitForCreateVariantWidgetButtonDisplayed();
            // 2. Click on 'Create Variant' button:
            await browseVariantsWidget.clickOnCreateVariantWidgetButton();
            await createVariantDialog.waitForDialogLoaded();
            // 3. Insert a valid name  for the variant:
            await createVariantDialog.typeTextInVariantNameInput(VARIANT_NAME_1);
            // 4. Verify that 'Create Variant' button gets enabled then click on this button:
            await createVariantDialog.clickOnCreateVariantButton();
            await createVariantDialog.waitForDialogClosed();
            await studioUtils.saveScreenshot('variant_created');
            // 5. Verify the notification message:
            let actualMessage = await browseVariantsWidget.waitForNotificationMessage();
            assert.equal(actualMessage, appConst.variantCreated(FOLDER_NAME));
        });

    it("GIVEN 'create variant dialog' is opened WHEN a name that already in use THEN 'Not available' message should appear",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseVariantsWidget = await studioUtils.openVariantsWidget();
            await browseVariantsWidget.waitForCreateVariantWidgetButtonNotDisplayed();
            // 3. Click on 'Create Variant' in the original item:
            await browseVariantsWidget.clickOnCreateVariantButtonInOriginalItem();
            await createVariantDialog.waitForDialogLoaded();
            // 4. Insert the name that already in use:
            await createVariantDialog.typeTextInVariantNameInput(VARIANT_NAME_1);
            await studioUtils.saveScreenshot('variant_not_available');
            // 5. Verify that 'Create Variant' gets disabled:
            await createVariantDialog.waitForCreateVariantButtonDisabled();
            // 6. Verify the validation message:
            let actualMessage = await createVariantDialog.waitForValidationPathMessageDisplayed();
            assert.equal(actualMessage, NOT_AVAILABLE_MESSAGE, "'Not available' message should appear in the dialog");
        });

    it("GIVEN 'create variant dialog' is opened WHEN Cancel butoon has been clicked THEN the dialog should be closed",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseVariantsWidget = await studioUtils.openVariantsWidget();
            await browseVariantsWidget.waitForCreateVariantWidgetButtonNotDisplayed();
            // 3. Click on 'Create Variant' in the original item:
            await browseVariantsWidget.clickOnCreateVariantButtonInOriginalItem();
            await createVariantDialog.waitForDialogLoaded();
            // 4. Click on Cancel top button:
            await createVariantDialog.clickOnCancelButtonTop();
            // 5. Verify that the dialog closes:
            await createVariantDialog.waitForDialogClosed();
        });

    it("GIVEN folder with variants has been filtered WHEN expander icon has been clicked THEN expected variant content should be displayed",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            // 2. Expand the folder
            await contentBrowsePanel.clickOnExpanderIcon(FOLDER_NAME);
            // 3. Verify that expected variant-content gets visible:
            await studioUtils.saveScreenshot('new_variant_in_grid');
            await contentBrowsePanel.waitForContentDisplayed(VARIANT_NAME_1);
        });

    it("GIVEN variant has been selected WHEN the variant has been duplicated THEN expected variant content should be displayed",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let duplicateVariantDialog = new DuplicateVariantDialog();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(VARIANT_NAME_1);
            let browseVariantsWidget = await studioUtils.openVariantsWidget();
            // 2. Click on 'Duplicate' button in the expanded variant-item
            await browseVariantsWidget.clickOnDuplicateButton();
            // 3. Duplicate Variant dialog should be loaded
            await duplicateVariantDialog.waitForLoaded();
            // 4. Click on Duplicate button in the dialog:
            await duplicateVariantDialog.clickOnDuplicateButton();
            // 5. Verify that the dialog is closed:
            await duplicateVariantDialog.waitForClosed();
            await browseVariantsWidget.pause(1200);
            await studioUtils.saveScreenshot('variant_duplicated');
            // 6. Verify notification messages
            let varCreated = appConst.variantCreated(FOLDER_NAME);
            let varDuplicated = appConst.itemDuplicated(VARIANT_NAME_1);
            let messages = await contentBrowsePanel.waitForNotificationMessages();
            assert.isTrue(messages.includes(varCreated), 'Variant has been created - this message should appear');
            assert.isTrue(messages.includes(varDuplicated), 'Item is duplicated - this message should appear');
        });

    it("GIVEN folder with 2 variants has been filtered WHEN expander icon has been clicked THEN expected duplicated variant with icon should be displayed",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            // 2. Expand the folder
            await contentBrowsePanel.clickOnExpanderIcon(FOLDER_NAME);
            // 3. Verify that expected duplicated variant-content is present:
            await studioUtils.saveScreenshot('duplicated_variant_in_grid');
            let copyName = VARIANT_NAME_1 + '-copy';
            await contentBrowsePanel.waitForContentDisplayed(copyName);
            // 4. Verify that both variants have correct icon:
            await contentBrowsePanel.waitForVariantIconDisplayed(VARIANT_NAME_1);
            await contentBrowsePanel.waitForVariantIconDisplayed(copyName);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
