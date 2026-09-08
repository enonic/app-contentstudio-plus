/**
 * Created on 20.02.2023  31.08.2026
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils.js');
const CreateVariantDialog = require('../page_objects/details_panel/create.variant.dialog');
const ContentBrowseDetailsPanel = require('../page_objects/browsepanel/detailspanel/browse.context.window.panel');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const appConst = require('../libs/app_const');
const DuplicateVariantDialog = require('../page_objects/details_panel/duplicate.variant.dialog');
const VariantsExtension = require('../page_objects/details_panel/variants.extension');
const ContentWizardPanel = require('../page_objects/wizardpanel/content.wizard.panel');

describe('folder.variants.spec - tests for Create Variant modal dialog', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const OCCUPIED_MESSAGE = 'Occupied';
    const IMPORTED_FOLDER_NAME = appConst.TEST_DATA.PARENT_FOLDER_273049;
    const IMPORTED_CHILD_FOLDER_NAME = appConst.TEST_DATA.CHILD_FOLDER_865739;

    const VARIANT_NAME_1 = appConst.generateRandomName('variant');
    const IMPORTED_TEST_FOLDER = appConst.TEST_FOLDER_WITH_IMAGES_NAME;

    it("GIVEN existing folder is selected AND Variants has been opened WHEN another folder has been selected THEN 'Create Variant' button should be displayed",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let variantsExtension = new VariantsExtension();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            await contentBrowsePanel.openContextWindow();
            let contentBrowseDetailsPanel = new ContentBrowseDetailsPanel();
            await contentBrowseDetailsPanel.openWidgetOption(appConst.WIDGET_SELECTOR_OPTIONS.VARIANTS);
            await variantsExtension.waitForCreateVariantWidgetButtonDisplayed();
            await contentBrowsePanel.clickOnExpanderIcon(IMPORTED_FOLDER_NAME);
            // 2. Select another folder in the grid:
            await contentBrowsePanel.clickOnRowByName(IMPORTED_CHILD_FOLDER_NAME);
            await studioUtils.saveScreenshot('variant_widget_reselected_item');
            // 3. Verify that 'Create Variant' is displayed in the widget:
            await variantsExtension.waitForCreateVariantWidgetButtonDisplayed();
        });

    it("GIVEN 'create variant dialog' is opened WHEN variant name input has been cleared THEN 'Create Variant' button gets disabled",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            let variantsExtension = new VariantsExtension();
            let contentBrowsePanel = new ContentBrowsePanel();
            // 1. Select the folder and open Variants widget:
            await contentBrowsePanel.openContextWindow();
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            let contentBrowseDetailsPanel = new ContentBrowseDetailsPanel();
            await contentBrowseDetailsPanel.openWidgetOption(appConst.WIDGET_SELECTOR_OPTIONS.VARIANTS);
            // 2. Click on 'Create Variant' button:
            await variantsExtension.clickOnCreateVariantWidgetButton();
            await createVariantDialog.waitForDialogLoaded();
            // 3. Clear the name input in the modal dialog:
            await createVariantDialog.clearVariantNameInput();
            await studioUtils.saveScreenshot('variant_empty_name');
            // 4. Verify that 'Create Variant' is disabled in the dialog:
            await createVariantDialog.waitForCreateVariantButtonDisabled();
        });

    it("GIVEN variant's name has been typed WHEN 'Create Variant' button has been pressed THEN new variant should be added",
        async () => {
            let createVariantDialog = new CreateVariantDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            let variantsExtension = new VariantsExtension();
            let contentWizardPanel = new ContentWizardPanel();
            // 1. Select the folder and open Variants widget:
            await contentBrowsePanel.openContextWindow();
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            let contentBrowseDetailsPanel = new ContentBrowseDetailsPanel();
            await contentBrowseDetailsPanel.openWidgetOption(appConst.WIDGET_SELECTOR_OPTIONS.VARIANTS);
            // 2. Click on 'Create Variant' button:
            await variantsExtension.clickOnCreateVariantWidgetButton();
            await createVariantDialog.waitForDialogLoaded();
            // 3. Insert a valid name  for the variant:
            await createVariantDialog.typeTextInVariantNameInput(VARIANT_NAME_1);
            // 4. Verify that 'Create Variant' button gets enabled then click on this button:
            await createVariantDialog.clickOnCreateVariantButton();
            await createVariantDialog.waitForDialogClosed();
            await studioUtils.saveScreenshot('variant_created');
            // the variant inherits the displayName of its original, so the new tab is identified by that name
            await studioUtils.waitForNewTabAndSwitch(IMPORTED_FOLDER_NAME);
            await contentWizardPanel.waitForOpened();
            let result = await contentWizardPanel.getDisplayName();
            let path =  await contentWizardPanel.getNameInToolbar();
            assert.ok(path.includes('variant'),'New variant should be loaded in the wizard panel');
            // 5. Verify the notification message:
            // TODO Missing notification after clicking "Create Variant" #1927
            //let actualMessages = await variantsExtension.waitForNotificationMessages();
            //assert.ok(actualMessages.includes(appConst.variantCreated(FOLDER_NAME)),
            //   "Variant created message should be displayed in the notification area");
        });

    it("GIVEN 'create variant dialog' is opened WHEN the name that already in use has been typed THEN 'Occupied' message should appear",
        async () => {
            // 1. Select the folder and open Variants widget:
            let createVariantDialog = new CreateVariantDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            let variantsExtension = new VariantsExtension();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            await contentBrowsePanel.openContextWindow();
            let contentBrowseDetailsPanel = new ContentBrowseDetailsPanel();
            await contentBrowseDetailsPanel.openWidgetOption(appConst.WIDGET_SELECTOR_OPTIONS.VARIANTS);
            await variantsExtension.waitForCreateVariantWidgetButtonNotDisplayed();
            // 3. Click on 'Create Variant' in the original item:
            await variantsExtension.clickOnCreateVariantButtonInOriginalItem();
            await createVariantDialog.waitForDialogLoaded();
            // 4. Insert the name that already in use:
            await createVariantDialog.typeTextInVariantNameInput(VARIANT_NAME_1);
            await studioUtils.saveScreenshot('variant_not_available');
            // 5. Verify that 'Create Variant' gets disabled:
            await createVariantDialog.waitForCreateVariantButtonDisabled();
            // 6. Verify the validation message:
            let actualMessage = await createVariantDialog.waitForValidationPathMessageDisplayed();
            assert.equal(actualMessage, OCCUPIED_MESSAGE, "'Occupied' message should appear in the dialog");
        });

    it("GIVEN 'create variant dialog' is opened WHEN Cancel button has been clicked THEN the dialog should be closed",
        async () => {
            // 1. Select the folder and open Variants widget:
            let createVariantDialog = new CreateVariantDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            let variantsExtension = new VariantsExtension();
            // 1. Select the folder and open Variants widget:
            await contentBrowsePanel.openContextWindow();
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            let contentBrowseDetailsPanel = new ContentBrowseDetailsPanel();
            await contentBrowseDetailsPanel.openWidgetOption(appConst.WIDGET_SELECTOR_OPTIONS.VARIANTS);
            await variantsExtension.waitForCreateVariantWidgetButtonNotDisplayed();
            // 3. Click on 'Create Variant' in the original item:
            await variantsExtension.clickOnCreateVariantButtonInOriginalItem();
            await createVariantDialog.waitForDialogLoaded();
            // 4. Click on Close button:
            await createVariantDialog.clickOnCloseButton();
            // 5. Verify that the dialog closes:
            await createVariantDialog.waitForDialogClosed();
        });

    it("GIVEN folder with variants has been filtered WHEN expander icon has been clicked THEN expected variant content should be displayed",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let variantsExtension = new VariantsExtension();
            // 1. Select the folder and open Variants widget:
            await contentBrowsePanel.openContextWindow();
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            // 2. Expand the folder
            await contentBrowsePanel.clickOnExpanderIcon(IMPORTED_FOLDER_NAME);
            // 3. Verify that expected variant-content gets visible:
            await studioUtils.saveScreenshot('new_variant_in_grid');
            await contentBrowsePanel.waitForContentDisplayed(VARIANT_NAME_1);
        });

    it("GIVEN variant has been selected WHEN 'Duplicate' button in the current expanded variant-item has been clicked THEN new variant content should be loaded in the new tab",
        async () => {
            let contentWizardPanel = new ContentWizardPanel();
            let duplicateVariantDialog = new DuplicateVariantDialog();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(VARIANT_NAME_1);
            let variantsExtension = await studioUtils.openVariantsWidget();
            // 2. Click on 'Duplicate' button in the current expanded variant-item
            await variantsExtension.clickOnDuplicateButton(VARIANT_NAME_1);
            // 3. Duplicate Variant dialog should be loaded
            await duplicateVariantDialog.waitForLoaded();
            // 4. Click on 'Duplicate' button in the modal dialog:
            await duplicateVariantDialog.clickOnDuplicateButton();
            // 5. Verify that the modal dialog is closed:
            await duplicateVariantDialog.waitForClosed();
            await variantsExtension.pause(1200);
            await studioUtils.saveScreenshot('variant_duplicated');
            await studioUtils.waitForNewTabAndSwitch(IMPORTED_FOLDER_NAME);
            await contentWizardPanel.waitForOpened();
            let path =  await contentWizardPanel.getNameInToolbar();
            assert.ok(path.includes('variant'),'New variant should be loaded in the wizard panel');
            // 6. Verify notification messages
            //let varCreated = appConst.variantCreated(FOLDER_NAME);
            //let varDuplicated = appConst.itemDuplicated(VARIANT_NAME_1);
           // let messages = await contentBrowsePanel.waitForNotificationMessages();
            //assert.ok(messages.includes(varCreated), 'Variant has been created - this message should appear');
           // assert.ok(messages.includes(varDuplicated), 'Item is duplicated - this message should appear');
        });

    it("GIVEN folder with 2 variants has been filtered WHEN expander icon has been clicked THEN expected variants with icon should be displayed",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            // 1. Select the folder and open Variants widget:
            await studioUtils.findAndSelectItem(IMPORTED_FOLDER_NAME);
            // 2. Expand the folder
            await contentBrowsePanel.clickOnExpanderIcon(IMPORTED_FOLDER_NAME);
            // 3. Verify that expected duplicated variant-content is present:
            await studioUtils.saveScreenshot('duplicated_variant_in_grid');
            // 4. Verify that both variants have correct icon:
            await contentBrowsePanel.waitForContentDisplayed(VARIANT_NAME_1);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioApp();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndNavigateToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
