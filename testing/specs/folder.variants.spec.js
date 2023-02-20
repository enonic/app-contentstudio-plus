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

describe('folder.variants.spec - tests for Create Variant modal dialog', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const NOT_AVAILABLE_MESSAGE = 'Not available';
    const FOLDER_NAME = studioUtils.generateRandomName('folder');
    const VARIANT_NAME_1 = appConst.generateRandomName('variant');
    const VARIANT_NAME_2 = appConst.generateRandomName('variant');

    it("GIVEN 'create variant dialog' is opened WHEN variant name input has been cleared THEN 'Create Variant' button gets disabled",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            let folder = contentBuilder.buildFolder(FOLDER_NAME);
            await studioUtils.doAddFolder(folder);
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


    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
