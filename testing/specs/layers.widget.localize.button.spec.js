/**
 * Created on 05.01.2023  updated on 07.09.2026
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils.js');
const projectUtils = require('../libs/project.utils.js');
const SettingsBrowsePanel = require('../page_objects/project/settings.browse.panel');
const contentBuilder = require("../libs/content.builder");
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const ContentWizard = require('../page_objects/wizardpanel/content.wizard.panel');
const appConst = require('../libs/app_const');
const ConfirmationDialog = require("../page_objects/confirmation.dialog");
const WizardLayersWidget = require("../page_objects/wizardpanel/details/wizard.layers.widget");

describe('layers.widget.localize.button.spec - checks Localize button in browse toolbar and Layers widget', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const LAYER_DISPLAY_NAME = studioUtils.generateRandomName('layer');
    const FOLDER_NAME =appConst.generateRandomName('folder');
    const EXPECTED_LANGUAGE_IN_WIZARD = 'norsk (no)';

    it("GIVEN the 'Default' project WHEN creating a layer with language 'Norsk (no)' THEN the layer is created",
        async () => {
            let settingsBrowsePanel = new SettingsBrowsePanel();
            await studioUtils.closeProjectSelectionDialog();
            await studioUtils.openSettingsPanel();
            // 1.'Default' project should be loaded after closing the 'Select project' dialog, then open wizard for new layer:
            await settingsBrowsePanel.openProjectWizardDialog();
            let layer = projectUtils.buildLayer('Default', appConst.LANGUAGES.NORSK_NO, appConst.PROJECT_ACCESS_MODE.PUBLIC, null,
                null, LAYER_DISPLAY_NAME);
            await projectUtils.fillFormsWizardAndClickOnCreateButton(layer);
            await settingsBrowsePanel.waitForNotificationMessage();
            await settingsBrowsePanel.pause(1000);
        });

    it("Precondition 2 - new folder should be added in 'Default' context",
        async () => {
            // Default project should be loaded automatically when SU is logged in the second time.
            // 1. folder1 - status is 'work in progress'
            let folder = contentBuilder.buildFolder(FOLDER_NAME);
            await studioUtils.doAddFolder(folder);
        });

    it("GIVEN inherited from the project content has been selected WHEN Layers widget has been opened THEN expected layers should be present",
        async () => {
            // 1. layer's context should be loaded by default now!
            // 2. Select the folder that was inherited from the parent project:
            await studioUtils.openProjectSelectionDialogAndSelectContext(LAYER_DISPLAY_NAME);
            await studioUtils.findContentAndClickCheckBox(FOLDER_NAME);
            // 3. Open Layers widget:
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            await studioUtils.saveScreenshot('layer_widget_1');
            // 4. Verify that two items should be displayed in the widget:
            let layersName = await browseLayersWidget.getLayersName();
            assert.equal(layersName.length, 2, 'Two layers should be present in the widget');
            assert.equal(layersName[0], 'Default', 'Default project should be present in the widget');
            assert.equal(layersName[1], LAYER_DISPLAY_NAME, "layer's display name should be present in the widget");
            // 5. Verify that 'Edit' button is enabled in the second item:
            await browseLayersWidget.waitForEditButtonEnabled(LAYER_DISPLAY_NAME);
            let language = await browseLayersWidget.getLayerLanguage(LAYER_DISPLAY_NAME);
            // 4. Verify the language in the widget item:
            assert.equal(language, '(no)', 'Expected language should be displayed in the layer');
        });

    it("GIVEN inherited content has been opened WHEN 'Localize' button in the wizard toolbar has been clicked THEN the language should be updated",
        async () => {
            let contentWizard = new ContentWizard();
            await studioUtils.openProjectSelectionDialogAndSelectContext(LAYER_DISPLAY_NAME);
            // 1. Select the folder in layer and open Layers widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            // 2. Click on 'Localize' button:
            await browseLayersWidget.clickOnEditButton(LAYER_DISPLAY_NAME);
            await studioUtils.switchToContentTabWindow(FOLDER_NAME);
            // 3. Verify that expected content is loaded in wizard page:
            await contentWizard.waitForOpened();
            await contentWizard.waitForSaveButtonNotDisplayed();
            // 4. Click on Localize button:
            await contentWizard.clickOnLocalizeButton();
            let actualDisplayName = await contentWizard.getDisplayName();
            let actualProjectName = await contentWizard.getProjectDisplayName();
            // 4. Open 'Edit Setting' modal dialog:
            let editSettingsDialog = await studioUtils.openEditSettingDialog();
            let actualLanguage = await editSettingsDialog.getSelectedLanguage();
            await editSettingsDialog.clickOnCloseButton();
            // 5. Verify the language
            assert.equal(actualLanguage, EXPECTED_LANGUAGE_IN_WIZARD, 'Expected language should be displayed in the wizard');
            assert.equal(actualDisplayName, FOLDER_NAME, `Expected folder's displayName should be displayed in the wizard`);
            assert.equal(actualProjectName, LAYER_DISPLAY_NAME + ' (no)', 'Expected project displayName should be displayed in the wizard');
            await contentWizard.openLayersWidget();
            let isLocalised = await browseLayersWidget.isContentLocalised(LAYER_DISPLAY_NAME);
            // 6. 'localised'  should be present in the widget item:
            assert.ok(isLocalised, "'Localised' should be displayed in the card");
        });

    it("GIVEN localized folder has been opened WHEN widget-item for 'Default' project has been clicked THEN 'Open' button button gets visible",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentWizardPanel = new ContentWizard();
            let wizardLayersWidget = new WizardLayersWidget();
            await studioUtils.openProjectSelectionDialogAndSelectContext(LAYER_DISPLAY_NAME);
            // 1. Select the folder:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            // 2. Click on `Edit` button and open it:
            await contentBrowsePanel.clickOnEditButton();
            await studioUtils.doSwitchToNextTab();
            await contentWizardPanel.waitForOpened();
            // 3. Open 'Layers' widget in the wizard:
            await contentWizardPanel.openLayersWidget();
            // 4. Click on the widget-item
            await wizardLayersWidget.clickOnWidgetItem('Default');
            // 5. Verify that 'Open' button becomes displayed
            await wizardLayersWidget.waitForOpenButtonEnabled('Default');
            // 6. Click on the widget-item for Default project:
            await wizardLayersWidget.clickOnOpenButton('Default');
            // 7. Switch to the new opened browser tab and verify the project name:
            await studioUtils.doSwitchToNextTab();
            let layerName = await contentWizardPanel.getProjectDisplayName();
            assert.equal(layerName, 'Default', 'Default layer should be displayed in this wizard page');
        });

    it("GIVEN existing localized content is opened WHEN 'Reset' button has been pressed THEN Not localised icon should be displayed in the widget item",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentWizardPanel = new ContentWizard();
            let confirmationDialog = new ConfirmationDialog();
            await studioUtils.openProjectSelectionDialogAndSelectContext(LAYER_DISPLAY_NAME);
            // The Context is loaded automatically :
            // 1. Select the folder:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            // 2. Click on `Edit` button and open this folder:
            await contentBrowsePanel.clickOnEditButton();
            await studioUtils.doSwitchToNextTab();
            await contentWizardPanel.waitForOpened();
            // 3. Click on Reset button and confirm it:
            await contentWizardPanel.clickOnResetButton();
            await confirmationDialog.waitForDialogOpened();
            await confirmationDialog.clickOnConfirmButton();
            await confirmationDialog.waitForDialogClosed();
            await contentWizardPanel.waitForNotificationMessage();
            // 4. Open Layers widget in the wizard:
            let wizardLayersWidget = new WizardLayersWidget();
            await contentWizardPanel.openLayersWidget();
            // 5. Verify that Edit button is enabled in the widget item:
            await wizardLayersWidget.waitForEditButtonEnabled(LAYER_DISPLAY_NAME);
            let isLocalised = await wizardLayersWidget.isContentLocalised(LAYER_DISPLAY_NAME);
            // 6. 'Not localised'  should be present in the name of the content because localizing changes are not saved:
            assert.ok(isLocalised === false, `'Not localised' should be displayed in the card`);
            // 7. Verify that Offline status is present in the Layer Content View:
            let actualStatus = await wizardLayersWidget.getContentStatus(LAYER_DISPLAY_NAME);
            assert.equal(actualStatus, 'Offline', 'Expected content status should be present in the widget item')
        });


    it('Post conditions: the layer should be deleted',
        async () => {
            await studioUtils.openSettingsPanel();
            await projectUtils.selectAndDeleteProject(LAYER_DISPLAY_NAME);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioApp();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndNavigateToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
