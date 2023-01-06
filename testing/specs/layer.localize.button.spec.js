/**
 * Created on 05.01.2023
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils.js');
const projectUtils = require('../libs/project.utils.js');
const SettingsBrowsePanel = require('../page_objects/project/settings.browse.panel');
const ProjectSelectionDialog = require('../page_objects/project/project.selection.dialog');
const contentBuilder = require("../libs/content.builder");
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const ContentWizard = require('../page_objects/wizardpanel/content.wizard.panel');
const SettingsForm = require('../page_objects/wizardpanel/settings.wizard.step.form');
const appConst = require('../libs/app_const');

describe('layer.localize.button.spec - checks Localize button in browse toolbar and Layers widget', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const LAYER_DISPLAY_NAME = studioUtils.generateRandomName('layer');
    const FOLDER_NAME = studioUtils.generateRandomName('folder');
    const FOLDER_2_NAME = studioUtils.generateRandomName('folder');
    const EXPECTED_LANGUAGE_IN_WIZARD = 'norsk (no)';

    it("Precondition 1 - layer(in Default) with 'Norsk(no)' language should be created",
        async () => {
            let settingsBrowsePanel = new SettingsBrowsePanel();
            await studioUtils.closeProjectSelectionDialog();
            await studioUtils.openSettingsPanel();
            //1.'Default' project should be loaded after closing the 'Select project' dialog, then open wizard for new layer:
            await settingsBrowsePanel.openProjectWizardDialog();
            let layer = projectUtils.buildLayer("Default", appConst.LANGUAGES.NORSK_NO, appConst.PROJECT_ACCESS_MODE.PUBLIC, null,
                null, LAYER_DISPLAY_NAME);
            await projectUtils.fillFormsWizardAndClickOnCreateButton(layer);
            await settingsBrowsePanel.waitForNotificationMessage();
        });

    it("Precondition 2 - two new folders should be added in 'Default' context",
        async () => {
            //Default project should be loaded automatically when SU is logged in the second time.
            //1. folder1 - status is 'work in progress'
            let folder = contentBuilder.buildFolder(FOLDER_NAME);
            await studioUtils.doAddFolder(folder);
            //2. folder2 - status is 'Ready to Publish'
            let folder2 = contentBuilder.buildFolder(FOLDER_2_NAME);
            await studioUtils.doAddReadyFolder(folder2);
        });

    it("GIVEN layer context is switched WHEN a content that is inherited from a parent has been selected THEN 'Localize' button gets visible and enabled",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            //1. Default project is loaded by default, so need to select the layer's context:
            await studioUtils.openProjectSelectionDialogAndSelectContext(LAYER_DISPLAY_NAME);
            //Wait for content is inherited from the parent project:
            await contentBrowsePanel.pause(5000);
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            await studioUtils.saveScreenshot('localize_button_browse_panel_enabled');
            //2. Verify that Localize button is enabled in the browse toolbar
            await contentBrowsePanel.waitForLocalizeButtonEnabled();
        });

    it("WHEN content, that is inherited from the parent project has been selected THEN 'Localize' button should be enabled in the second layer widget item",
        async () => {
            let projectSelectionDialog = new ProjectSelectionDialog();
            //1. layer's context should be loaded by default now!
            //2. Select the folder that was inherited from the parent project:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            //3. Open Layers widget:
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            await studioUtils.saveScreenshot('localize_button_widget_enabled');
            //4. Verify that two items should be displayed in the widget:
            let layersName = await browseLayersWidget.getLayersName();
            assert.equal(layersName.length, 2, 'Two layers should be present in the widget');
            //5. Verify that 'Localize' button is enabled in the second item:
            await browseLayersWidget.waitForLocalizeButtonEnabled(LAYER_DISPLAY_NAME);
        });

    it("GIVEN content that is inherited from a parent has been selected WHEN Layers widget has been opened THEN expected layers should be present",
        async () => {
            //1. Select the folder in layer and open Layers widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            let layers = await browseLayersWidget.getLayersName();
            //2. Verify names of layers:
            assert.equal(layers[0], 'Default', 'Default project should be present in the widget');
            assert.equal(layers[1], LAYER_DISPLAY_NAME, "layer's display name should be present in the widget");
            let language = await browseLayersWidget.getLayerLanguage(LAYER_DISPLAY_NAME);
            //3. Verify 'Localize' button in the widget:
            await browseLayersWidget.waitForLocalizeButtonEnabled(LAYER_DISPLAY_NAME);
            //4. Verify the language in the widget:
            assert.equal(language, "(no)", 'Expected language should be displayed in the layer');
        });

    it("GIVEN content that is inherited from a parent has been selected WHEN Localize button(in widget) has been clicked THEN the content should be loaded in the new wizard tab",
        async () => {
            let contentWizard = new ContentWizard();
            let wizardSettingsForm = new SettingsForm();
            //1. Select the folder in layer and open Layers widget:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            //2. Click on 'Localize' button:
            await browseLayersWidget.clickOnLocalizeButton(LAYER_DISPLAY_NAME);
            await studioUtils.doSwitchToNextTab();
            //4. Verify that expected content is loaded in wizard page:
            await contentWizard.waitForOpened();
            let actualDisplayName = await contentWizard.getDisplayName();
            let actualProjectName = await contentWizard.getProjectDisplayName();
            let actualLanguage = await wizardSettingsForm.getSelectedLanguage();
            assert.equal(actualLanguage, EXPECTED_LANGUAGE_IN_WIZARD, 'Expected language should be displayed in the wizard');
            assert.equal(actualDisplayName, FOLDER_NAME, "Expected folder's displayName should be displayed in the wizard");
            assert.equal(actualProjectName, LAYER_DISPLAY_NAME + "(no)", 'Expected project displayName should be displayed in the wizard');
        });

    it("GIVEN existing content is opened for localizing WHEN Layers widget has been opened THEN postfix with '?' should be present in the name of folder because localizing changes are not saved",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentWizardPanel = new ContentWizard();
            // The Context is loaded automatically :
            //1. Select the folder:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            //2. Click on `Localize` button and open this folder:
            await contentBrowsePanel.clickOnLocalizeButton();
            await studioUtils.doSwitchToNextTab();
            await contentWizardPanel.waitForOpened();
            //3. Open Layers widget in the wizard:
            let wizardLayersWidget = await contentWizardPanel.openLayersWidget();
            let contentNameAndLanguage = await wizardLayersWidget.getContentNameWithLanguage(LAYER_DISPLAY_NAME);
            //4. postfix '(?)' should be present in the name of the content because localizing changes are not saved:
            assert.equal(contentNameAndLanguage, FOLDER_NAME + '(?)', "postfix '(?)' should be present in the content name");
            //5. Verify that New status is present in the Layer Content View:
            let actualStatus = await wizardLayersWidget.getContentStatus(LAYER_DISPLAY_NAME);
            assert.equal(actualStatus, 'New', 'Expected content status should be present in the widget item')
        });

    it("GIVEN content that is inherited from a parent has been opened WHEN 'Layers' widget has been opened in the wizard THEN expected layers should be present in the widget",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentWizardPanel = new ContentWizard();
            //1. Select the folder:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            //2. Click on `Localize` button and open it:
            await contentBrowsePanel.clickOnLocalizeButton();
            await studioUtils.doSwitchToNextTab();
            await contentWizardPanel.waitForOpened();
            //3. Open Layers widget in the wizard:
            let wizardLayersWidget = await contentWizardPanel.openLayersWidget();
            let layers = await wizardLayersWidget.getLayersName();
            //4. Verify names of layers:
            assert.equal(layers[0], 'Default', 'Default layer should be present in the widget');
            assert.equal(layers[1], LAYER_DISPLAY_NAME, "layer's layer should be present in the widget");
            let language = await wizardLayersWidget.getLayerLanguage(LAYER_DISPLAY_NAME);
            //5. Verify Localize button in the widget:
            await wizardLayersWidget.waitForLocalizeButtonEnabled(LAYER_DISPLAY_NAME);
            //6. Verify the language in the widget:
            assert.equal(language, '(no)', "Expected language should be displayed in the layer");
        });

    it("GIVEN content that is inherited from a parent has been opened WHEN 'Save' button has been pressed THEN 'Localize' button should be replaced with 'Edit' button",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentWizardPanel = new ContentWizard();
            // layer's context should be loaded by default now!
            // 1. Select the folder:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            // 2. Click on `Localize` button and open it:
            await contentBrowsePanel.clickOnLocalizeButton();
            await studioUtils.doSwitchToNextTab();
            await contentWizardPanel.waitForOpened();
            let localizedMes = await contentWizardPanel.waitForNotificationMessage();
            // Expected Message: Language was copied from current project
            assert.equal(localizedMes, appConst.LOCALIZED_MESSAGE_1, 'Expected message should appear after the content has been opened');
            // 3. Remove the current notification message:
            await contentWizardPanel.removeNotificationMessage();
            // 4. Open Layers widget in the wizard:
            let wizardLayersWidget = await contentWizardPanel.openLayersWidget();
            // 5. Click on 'Save' button:
            await contentWizardPanel.waitAndClickOnSave();
            // 6. Verify the notification message:
            let actualMessage = await contentWizardPanel.waitForNotificationMessage();
            // Expected Message: Inherited content was localized:
            assert.equal(actualMessage, appConst.LOCALIZED_MESSAGE_2, 'Expected message should appear after saving the content');
            // 7. Verify that 'Edit' button gets visible in the widget:
            await wizardLayersWidget.waitForEditButtonEnabled(LAYER_DISPLAY_NAME);
            // 8. Verify that postfix '(?)' is not present in the name in the widget item
            let result = await wizardLayersWidget.getContentNameWithLanguage(LAYER_DISPLAY_NAME);
            assert.equal(result, FOLDER_NAME, "postfix '(?)' should not be displayed in the name, because the content is localized");
        });

    it("GIVEN localized folder has been opened WHEN widget-item for 'Default' project has been clicked THEN 'Open' button button gets visible",
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentWizardPanel = new ContentWizard();
            // layer's context should be loaded by default now!
            // 1. Select the folder:
            await studioUtils.findAndSelectItem(FOLDER_NAME);
            // 2. Click on `Edit` button and open it:
            await contentBrowsePanel.clickOnEditButton();
            await studioUtils.doSwitchToNextTab();
            await contentWizardPanel.waitForOpened();
            // 3. Open Layers widget in the wizard:
            let wizardLayersWidget = await contentWizardPanel.openLayersWidget();
            // 4. Click on the widget-item
            await wizardLayersWidget.clickOnWidgetItem('Default');
            // 5. Verify that Open button gets visible"
            await wizardLayersWidget.waitForOpenButtonEnabled('Default');
            // 6. Click on the widget-item for Default project:
            await wizardLayersWidget.clickOnOpenButton('Default');
            // 7. Switch to the new opened browser tab and verify the project name:
            await studioUtils.doSwitchToNextTab();
            let layerName = await contentWizardPanel.getProjectDisplayName();
            assert.equal(layerName, 'Default', 'Default layer should be displayed in this wizard page');
        });

    it('Post conditions: the layer should be deleted',
        async () => {
            await studioUtils.openSettingsPanel();
            await projectUtils.selectAndDeleteProject(LAYER_DISPLAY_NAME);
        });

    beforeEach(async () => {
        return await studioUtils.navigateToContentStudioWithProjects();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
