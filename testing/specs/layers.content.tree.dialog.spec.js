/**
 * Created on 05.01.2023
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
const ContentPublishDialog = require('../page_objects/content.publish.dialog');

describe('layers.content.tree.dialog.spec - tests for Layers Content Tree modal dialog', function () {
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
            let layer = projectUtils.buildLayer(LAYER1_DISPLAY_NAME, appConst.LANGUAGES.NORSK_NO, appConst.PROJECT_ACCESS_MODE.PUBLIC, null,
                null, LAYER2_DISPLAY_NAME);
            await settingsBrowsePanel.clickOnNewButton();
            await projectUtils.fillFormsWizardAndClickOnCreateButton(layer);
            await settingsBrowsePanel.waitForNotificationMessage();
        });

    it(`GIVEN existing folder is selected in the layer WHEN 'Show All' button has been clicked THEN 'Layers Tree' dialog should be loaded`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            // 1. Open modal dialog and select the layer's context:
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 2. Select the folder and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            let layersContentTreeDialog = await browseLayersWidget.clickOnShowAllButton();
            await studioUtils.saveScreenshot('layers_tree_dialog_1');
            // 3. Verify the title:
            let title = await layersContentTreeDialog.getTitle();
            assert.equal(TEST_FOLDER_DISPLAY_NAME, title, 'Expected title should be in the modal dialog');
            let layers = await layersContentTreeDialog.getLayersName();
            // 4. Verify that all items are present in the Layers Tree:
            assert.equal(layers[0], PROJECT_DISPLAY_NAME, 'Expected project should be present in the tree layers');
            assert.equal(layers[1], LAYER1_DISPLAY_NAME, 'The first layer should be present in the tree layers');
            assert.equal(layers[2], LAYER2_DISPLAY_NAME, 'The second layer should be present in the tree layers');
        });

    it(`GIVEN 'Layers Tree' modal dialog is opened WHEN site layer-item has been clicked in the modal dialog THEN 'Localize' button gets visible`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 1. Select the folder and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            let layersContentTreeDialog = await browseLayersWidget.clickOnShowAllButton();
            await layersContentTreeDialog.clickOnLayerByName(PROJECT_DISPLAY_NAME);
            await studioUtils.saveScreenshot('layers_tree_dialog_2');
            let buttonLabel = await layersContentTreeDialog.getButtonLabelInItemView(PROJECT_DISPLAY_NAME);
            assert.equal(buttonLabel, 'Open', `'Open' button gets visible in the modal dialog`);
        });

    it(`GIVEN inherited content is selected AND 'Layers Tree dialog' is opened WHEN layer-item for the current layer has been clicked in the dialog THEN 'Localise' button gets visible in the tree list item`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.switchToContentMode();
            // 1. Open modal dialog and select the layer's context:
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            // 2. Select the folder and open Layers widget:
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            let layersContentTreeDialog = await browseLayersWidget.clickOnShowAllButton();
            // 3. Click and expand the list item:
            await layersContentTreeDialog.clickOnLayerByName(LAYER1_DISPLAY_NAME);
            await studioUtils.saveScreenshot('layers_tree_dialog_2');
            // 4. Verify that 'Localize' button is present in the tree item:
            let buttonLabel = await layersContentTreeDialog.getButtonLabelInItemView(LAYER1_DISPLAY_NAME);
            assert.equal(buttonLabel, 'Localize', `'Localize' button gets visible in the tree list item`);
        });

    // Verify the bug - Layers widget shows incorrect content status in parent project #8425
    // https://github.com/enonic/app-contentstudio/issues/8425
    // https://github.com/enonic/app-contentstudio-plus/issues/1414
    it(`GIVEN inherited content has been published WHEN 'Layers Tree dialog' has been opened THEN the only inherited content should be displayed as published`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let contentPublishDialog = new ContentPublishDialog();
            await studioUtils.switchToContentMode();
            // 1. Open modal dialog and select the layer's context:
            await contentBrowsePanel.selectContext(LAYER1_DISPLAY_NAME);
            await studioUtils.findAndSelectItem(TEST_FOLDER_DISPLAY_NAME);
            await contentBrowsePanel.clickOnMarkAsReadyButton();

            await contentPublishDialog.waitForDialogOpened();
            await contentPublishDialog.clickOnPublishNowButton();
            await contentBrowsePanel.waitForNotificationMessage();
            // 2. open Layers widget:
            let browseLayersWidget = await studioUtils.openLayersWidgetInBrowsePanel();
            let layersContentTreeDialog = await browseLayersWidget.clickOnShowAllButton();
            // 3. Click and expand the list item:
            await layersContentTreeDialog.clickOnLayerByName(LAYER1_DISPLAY_NAME);
            await studioUtils.saveScreenshot('layers_tree_dialog_published_inherited_content');
            // 4. Verify the statuses for the content in the layer and parent project:
            let actualStatus = await layersContentTreeDialog.getContentStatus(LAYER1_DISPLAY_NAME);
            assert.equal(actualStatus[0], 'Published', `'Published' status should be displayed for content in the layer`);

            let actualStatusParent = await layersContentTreeDialog.getContentStatus(PROJECT_DISPLAY_NAME);
            assert.equal(actualStatusParent[0], 'New', `'New' status should be displayed for parent content`);
        });

    it(`GIVEN the local copy of inherited folder is selected WHEN Layers widget has been opened THEN only one item with button 'Edit' should be present in the widget`,
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
            // 4.Verify that only one item with button 'Edit' should be present in the widget:
            let layers = await browseLayersWidget.getLayersName();
            assert.equal(layers.length, 1, 'Only one widget-item should be present in the widget');
            await browseLayersWidget.waitForEditButtonEnabled(LAYER1_DISPLAY_NAME);
            // 5. Verify that 'Show All' button is displayed in the widget, because one more layer was created
            await browseLayersWidget.waitForShowAllButtonDisplayed();
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
