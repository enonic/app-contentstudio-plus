/**
 * Created on 05.01.2023 updated 06.08.2025
 */
const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils.js');
const projectUtils = require('../libs/project.utils.js');
const SettingsBrowsePanel = require('../page_objects/project/settings.browse.panel');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const contentBuilder = require('../libs/content.builder');
const appConst = require('../libs/app_const');
const ConfirmValueDialog = require('../page_objects/confirm.content.delete.dialog');

describe('layers.content.tree.widget.spec - tests for Layers  Tree  in the widget', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    // setup standalone mode if WDIO is not defined:
    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const TEST_FOLDER_DISPLAY_NAME = studioUtils.generateRandomName('folder');
    const PROJECT_DISPLAY_NAME = studioUtils.generateRandomName('project');
    const LAYER1_DISPLAY_NAME = studioUtils.generateRandomName('layer');
    const LAYER2_DISPLAY_NAME = studioUtils.generateRandomName('layer');

    it('Preconditions: new project with folder should be added',
        async () => {
            //1. Navigate to Settings Panel and save new project:
            await projectUtils.saveTestProject(PROJECT_DISPLAY_NAME, 'description', null, null);
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            await contentBrowsePanel.selectContext(PROJECT_DISPLAY_NAME);
            let folder = contentBuilder.buildFolder(TEST_FOLDER_DISPLAY_NAME);
            await studioUtils.doAddFolder(folder);
        });

    it('Precondition 1 - the first layer(En) should be added in Default project',
        async () => {
            let settingsBrowsePanel = new SettingsBrowsePanel();
            //1.Select 'Default' project and open wizard for new layer:
            await settingsBrowsePanel.openProjectWizardDialog();
            let layer = projectUtils.buildLayer(PROJECT_DISPLAY_NAME, appConst.LANGUAGES.EN, appConst.PROJECT_ACCESS_MODE.PUBLIC, null,
                null, LAYER1_DISPLAY_NAME);
            await projectUtils.fillFormsWizardAndClickOnCreateButton(layer);
            await settingsBrowsePanel.waitForNotificationMessage();
        });

    it('Precondition 2 - the second layer(Norsk no) should be added in the just created layer',
        async () => {
            let settingsBrowsePanel = new SettingsBrowsePanel();
            let layer = projectUtils.buildLayer(LAYER1_DISPLAY_NAME, appConst.LANGUAGES.NORSK_NO, appConst.PROJECT_ACCESS_MODE.PUBLIC, null,null,LAYER2_DISPLAY_NAME);
            await settingsBrowsePanel.clickOnNewButton();
            await projectUtils.fillFormsWizardAndClickOnCreateButton(layer);
            await settingsBrowsePanel.waitForNotificationMessage();
        });

    it(`GIVEN existing folder is selected in the layer WHEN Layers widget has been opened THEN 3 layers should be displayed`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            // 1. select the layer's context:
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 2. Select the folder and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            await studioUtils.saveScreenshot('layers_widget_1');
            // 3. Verify  all items in the widget:
            let layers = await browseLayersWidget.getLayersName();
            // 4. Verify that parent project and 2 its layers are displayed in the Layers Tree:
            assert.equal(layers[0], PROJECT_DISPLAY_NAME, 'Expected project should be present in the tree layers');
            assert.equal(layers[1], LAYER1_DISPLAY_NAME, 'The first layer should be present in the tree layers');
            assert.equal(layers[2], LAYER2_DISPLAY_NAME, 'The second layer should be present in the tree layers');
        });

    it(`GIVEN layer1 context is selected WHEN inherited folder has been selected AND parent project item has been clicked in the widget THEN 'Open' button gets visible in the widget`,
        async () => {
            await studioUtils.switchToContentMode();
            // 1. Open modal dialog and select the layer's context:
            //await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 2. Select the folder and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            // 2. Click on parent project-item in the widget:
            await browseLayersWidget.clickOnWidgetItem(PROJECT_DISPLAY_NAME);
            await studioUtils.saveScreenshot('layers_tree_widget_2');
            // 3. Verify that 'Open' button should be displayed for its parent project-item:
            await browseLayersWidget.waitForOpenButtonEnabled(PROJECT_DISPLAY_NAME);
        });

    it(`GIVEN layer1 context is selected WHEN inherited folder has been selected THEN layer-item for the current layer gets expanded in the widgets AND 'Localise' button gets visible for the layer-item`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            // 1. Open modal dialog and select the layer's context:
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 2. Select the folder and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            await studioUtils.saveScreenshot('layers_tree_widget_3');
            // 3. Verify that 'Localize' button should be displayed after selecting the folder in the current layer's context:
            await browseLayersWidget.waitForLocalizeButtonEnabled(LAYER1_DISPLAY_NAME);
        });

    it(`WHEN layer1 context is selected AND inherited content has been published THEN only inherited content should be displayed as published in the widget`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentPublishDialog = new ContentPublishDialog();
            await studioUtils.switchToContentMode();
            // 1. Go to layer1:
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 2. Publish  the inherited content:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            await contentBrowsePanel.clickOnMarkAsReadyButton();
            await contentPublishDialog.waitForDialogOpened();
            await contentPublishDialog.clickOnPublishNowButton();
            await contentBrowsePanel.waitForNotificationMessage();
            // 3. open Layers widget:
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            // 4. Verify that 'Published' status should be displayed for the inherited content in the layer-item:
            let actualStatus = await browseLayersWidget.getContentStatus(LAYER1_DISPLAY_NAME);
            assert.equal(actualStatus, 'Published', `'Published' status should be displayed for inherited content in layer-item`);
            // 5. Verify that 'New' status should be displayed for the content in parent project-item:
            let actualStatusParent = await browseLayersWidget.getContentStatus(PROJECT_DISPLAY_NAME);
            assert.equal(actualStatusParent, 'New', `'New' status should be displayed for content in parent project-item`);

        });

    it(`GIVEN the local copy of inherited folder is selected WHEN Layers widget has been opened THEN 2 layer-items should be displayed in the widget AND current layer should be selected in the widget AND 'Edit' button should be visible`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            // 1. Select the layer's context:
            await studioUtils.openProjectSelectionDialogAndSelectContext(LAYER1_DISPLAY_NAME);
            // 2. Duplicate the folder that is inherited from the parent project:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let contentDuplicateDialog = await contentBrowsePanel.clickOnDuplicateButtonAndWait();
            await contentDuplicateDialog.clickOnDuplicateButton();
            await contentDuplicateDialog.waitForDialogClosed();
            // 3. Select the local copy of inherited site and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME + '-copy');
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            await studioUtils.saveScreenshot('layers_widget_local_copy_of_folder');
            // 4.Verify that 2 layers items with button 'Edit' should be present in the widget:
            let layers = await browseLayersWidget.getLayersName();
            assert.equal(layers.length, 2, '2  layers-items should be present in the widget');
            // 5. Verify that the current layer is selected in the widget and 'Edit' button gets visible:
            await browseLayersWidget.waitForEditButtonEnabled(LAYER1_DISPLAY_NAME);
        });

    it('WHEN children layers have been sequentially removed THEN parent project can be deleted',
        async () => {
            let settingsBrowsePanel = new SettingsBrowsePanel();
            let confirmValueDialog = new ConfirmValueDialog();
            // 1.Delete the first layer:
            await settingsBrowsePanel.clickOnRowByDisplayName(LAYER2_DISPLAY_NAME);
            await settingsBrowsePanel.clickOnDeleteButton();
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(LAYER2_DISPLAY_NAME);
            await confirmValueDialog.clickOnConfirmButton();
            await settingsBrowsePanel.waitForNotificationMessage();
            // 2.Delete the second layer:
            await settingsBrowsePanel.clickOnRowByDisplayName(LAYER1_DISPLAY_NAME);
            await settingsBrowsePanel.clickOnDeleteButton();
            await confirmValueDialog.waitForDialogOpened();
            await confirmValueDialog.typeNumberOrName(LAYER1_DISPLAY_NAME);
            await confirmValueDialog.clickOnConfirmButton();
            await settingsBrowsePanel.waitForNotificationMessage();
        });

    beforeEach(async () => {
        await studioUtils.navigateToContentStudioCloseProjectSelectionDialog();
        return await studioUtils.openSettingsPanel();
    });
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
