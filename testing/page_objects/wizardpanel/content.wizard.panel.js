/**
 * Created on 5/30/2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const contentBuilder = require('../../libs/content.builder');
const ContentStepForm = require('./content.wizard.step.form');
const ContextWindow = require('./liveform/liveform.context.window');
const DetailsPanel = require('./details/wizard.details.panel');
const ConfirmationDialog = require("../../page_objects/confirmation.dialog");
const ContentPublishDialog = require("../../page_objects/content.publish.dialog");
const VersionsWidget = require('./details/wizard.versions.widget');
const CreateRequestPublishDialog = require('../../page_objects/issue/create.request.publish.dialog');
const BrowsePanel = require('../../page_objects/browsepanel/content.browse.panel');
const RenamePublishedContentDialog = require('./rename.content.dialog');
const WizardLayersWidget = require('./details/wizard.layers.widget');
const ContentUnpublishDialog = require('../content.unpublish.dialog');
const WizardDependenciesWidget = require('./details/wizard.dependencies.widget');
const PropertiesWidget = require('../browsepanel/detailspanel/properties.widget.itemview');
const EditSettingsDialog = require('../details_panel/edit.settings.dialog');

const XPATH = {
    container: `//div[contains(@id,'ContentWizardPanel')]`,
    wizardHeader: "//div[contains(@id,'ContentWizardHeader')]",
    pageEditorTogglerButton: "//button[contains(@id, 'CycleButton') ]",
    hidePageEditorTogglerButton: "//button[contains(@id,'CycleButton') and @title='Hide Page Editor']",
    showPageEditorTogglerButton: "//button[contains(@id,'CycleButton') and @title='Show Page Editor']",
    displayNameInput: "//input[@name='displayName']",
    pathInput: "//input[@name='name']",
    toolbar: `//div[contains(@id,'ContentWizardToolbar')]`,
    toolbarStateIcon: `//div[contains(@class,'toolbar-state-icon')]`,
    publishMenuButton: "//div[contains(@id,'ContentWizardPublishMenuButton')]",
    toolbarPublish: "//div[contains(@id,'ContentWizardToolbarPublishControls')]",
    saveButton: `//button[contains(@id,'ActionButton') and child::span[text()='Save']]`,
    savedButton: `//button[contains(@id,'ActionButton') and child::span[text()='Saved']]`,
    savingButton: `//button[contains(@id,'ActionButton') and child::span[text()='Saving...']]`,
    archiveButton: `//button[contains(@id,'ActionButton') and child::span[text()='Archive...']]`,
    duplicateButton: `//button[contains(@id,'ActionButton') and child::span[text()='Duplicate...']]`,
    previewButton: `//button[contains(@id,'ActionButton') and child::span[text()='Preview']]`,
    resetButton: "//button[contains(@id,'ActionButton') and child::span[text()='Reset']]",
    publishButton: "//button[contains(@id,'ActionButton') and child::span[text()='Publish...']]",
    createIssueButton: "//button[contains(@id,'ActionButton') and child::span[text()='Create Issue...']]",
    markAsReadyButton: "//button[contains(@id,'ActionButton') and child::span[text()='Mark as ready']]",
    openRequestButton: "//button[contains(@id,'ActionButton') and child::span[text()='Open Request...']]",
    unpublishButton: "//button[contains(@id,'ActionButton') and child::span[text()='Unpublish...']]",
    unpublishMenuItem: "//ul[contains(@id,'Menu')]//li[contains(@id,'MenuItem') and text()='Unpublish...']",
    inspectionPanelToggler: "//button[contains(@id, 'TogglerButton') and contains(@class,'icon-cog')]",
    showComponentViewToggler: "//button[contains(@id, 'TogglerButton') and @title='Show Component View']",
    componentViewToggler: "//button[contains(@id, 'TogglerButton')  and contains(@class,'icon-clipboard')]",
    hideComponentViewToggler: "//button[contains(@id, 'TogglerButton') and @title='Hide Component View']",
    thumbnailUploader: "//div[contains(@id,'ThumbnailUploaderEl')]",
    liveEditFrame: "//iframe[contains(@class,'live-edit-frame')]",
    pageDescriptorViewer: `//div[contains(@id,'PageDescriptorViewer')]`,
    scheduleTabBarItem: `//li[contains(@id,'ContentTabBarItem') and @title='Schedule']`,
    scheduleForm: "//div[contains(@id,'ScheduleWizardStepForm')]",
    detailsPanelToggleButton: `//button[contains(@id,'NonMobileContextPanelToggleButton')]`,
    itemViewContextMenu: `//div[contains(@id,'ItemViewContextMenu')]`,
    xDataToggler: `//div[contains(@id,'WizardStepsPanel')]//div[@class='x-data-toggler']`,
    stepNavigatorToolbar: `//ul[contains(@id,'WizardStepNavigator')]`,
    wizardStepNavigatorAndToolbar: "//div[contains(@id,'WizardStepNavigatorAndToolbar')]",
    status: `//div[contains(@class,'content-status-wrapper')]/span[contains(@class,'status')]`,
    author: `//div[contains(@class,'content-status-wrapper')]/span[contains(@class,'author')]`,
    buttonModifyPath: "//button[contains(@class,'icon-pencil')]",
    shaderPage: "//div[@class='xp-page-editor-shader xp-page-editor-page']",
    goToGridButton: "//div[contains(@class,'font-icon-default icon-tree-2')]",
    helpTextsButton: "//div[contains(@class,'help-text-button')]",
    pagePlaceholderInfoBlock1: "//div[contains(@id,'PagePlaceholderInfoBlock')]//div[contains(@class,'page-placeholder-info-line1')]",
    showChangesButtonToolbar: "//a[contains(@class,'show-changes') and text()='Show changes']",
    wizardStepByName:
        name => `//ul[contains(@id,'WizardStepNavigator')]//li[child::a[text()='${name}']]`,
    wizardStepByTitle:
        name => `//ul[contains(@id,'WizardStepNavigator')]//li[contains(@id,'ContentTabBarItem') and @title='${name}']`,
    xDataTogglerByName:
        name => `//div[contains(@id,'WizardStepsPanel')]//div[@class='x-data-toggler' and preceding-sibling::span[contains(.,'${name}')]]`,
    publishMenuItemByName: function (name) {
        return `//div[contains(@id,'ContentWizardToolbar')]//ul[contains(@id,'Menu')]//li[contains(@id,'MenuItem') and contains(.,'${name}')]`
    },
};

class ContentWizardPanel extends Page {

    get displayNameInput() {
        return XPATH.container + XPATH.displayNameInput;
    }

    get pathInput() {
        return XPATH.container + XPATH.pathInput;
    }

    get pageEditorTogglerButton() {
        return XPATH.toolbar + XPATH.pageEditorTogglerButton;
    }

    get detailsPanelToggleButton() {
        return XPATH.container + XPATH.detailsPanelToggleButton;
    }

    get saveButton() {
        return XPATH.container + XPATH.saveButton;
    }

    get resetButton() {
        return XPATH.container + XPATH.resetButton;
    }

    get savedButton() {
        return XPATH.container + XPATH.savedButton;
    }

    get savingButton() {
        return XPATH.container + XPATH.savingButton;
    }

    get publishButton() {
        return XPATH.container + XPATH.toolbar + XPATH.publishButton;
    }

    get publishDropDownHandle() {
        return XPATH.toolbarPublish + lib.DROP_DOWN_HANDLE;
    }

    get unpublishMenuItem() {
        return XPATH.toolbarPublish + XPATH.unpublishMenuItem;
    }

    get thumbnailUploader() {
        return XPATH.container + XPATH.thumbnailUploader;
    }

    get showChangesToolbarButton() {
        return XPATH.toolbar + XPATH.showChangesButtonToolbar;
    }

    get workflowIconAndValidation() {
        return XPATH.container + XPATH.thumbnailUploader + "//div[contains(@class, 'workflow-status')]";
    }

    get archiveButton() {
        return XPATH.container + XPATH.toolbar + XPATH.archiveButton;
    }

    get duplicateButton() {
        return XPATH.container + XPATH.toolbar + XPATH.duplicateButton;
    }

    get previewButton() {
        return XPATH.container + XPATH.toolbar + XPATH.previewButton;
    }

    get controllerOptionFilterInput() {
        return "//div[contains(@id,'PagePlaceholder')]" + lib.DROPDOWN_OPTION_FILTER_INPUT;
    }

    get showComponentViewToggler() {
        return XPATH.container + XPATH.toolbar + XPATH.showComponentViewToggler;
    }

    get hideComponentViewToggler() {
        return XPATH.container + XPATH.toolbar + XPATH.hideComponentViewToggler;
    }

    get componentViewToggler() {
        return XPATH.container + XPATH.toolbar + XPATH.componentViewToggler;
    }

    get wizardToolbarHelpButton() {
        return XPATH.wizardStepNavigatorAndToolbar + XPATH.helpTextsButton;
    }

    get modifyPathButton() {
        return XPATH.wizardHeader + XPATH.buttonModifyPath;
    }

    get goToGridButton() {
        return XPATH.toolbar + XPATH.goToGridButton;
    }

    async waitForHelpTextsButtonTogglerDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.wizardToolbarHelpButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_help_textx_button"));
            throw new Error("Help texts toggler button is not displayed in the wizard! " + err);
        }
    }

    async clickOnHelpTextsToggler() {
        await this.waitForHelpTextsButtonTogglerDisplayed();
        return await this.clickOnElement(this.wizardToolbarHelpButton);
    }

    waitForContextWindowVisible() {
        let contextWindow = new ContextWindow();
        return contextWindow.waitForOpened();
    }

    waitForShaderDisplayed() {
        return this.waitForElementDisplayed(XPATH.shaderPage, appConst.mediumTimeout);
    }

    waitForScheduleFormVisible() {
        return this.waitForElementDisplayed(XPATH.scheduleForm, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('schedule_form_should_not_be_visible');
            return false;
        })
    }

    waitForScheduleFormNotVisible() {
        return this.waitForElementNotDisplayed(XPATH.scheduleForm, appConst.mediumTimeout);
    }

    waitForShowComponentVewTogglerVisible() {
        return this.waitForElementDisplayed(this.showComponentViewToggler, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_show_component_toggler_should_be_visible');
            throw new Error('Component View toggler is not visible in ' + 2 + '  ' + err);
        })
    }

    //Wait for button with "Show Component View" title is visible
    async waitForShowComponentVewTogglerNotVisible() {
        try {
            let res = await this.getDisplayedElements(this.showComponentViewToggler);
            await this.waitForElementNotDisplayed(this.showComponentViewToggler, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_show_component_toggler_visible'));
            throw new Error('Component View toggler is still visible after the interval sec:' + 3 + '  ' + err);
        }
    }

    //Wait for button(toggler) for "Component View" is not visible
    async waitForComponentVewTogglerNotVisible() {
        try {
            await this.waitForElementNotDisplayed(this.componentViewToggler, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_component_toggler_should_visible'));
            throw new Error('Component View toggler is still visible after sec:' + 3 + '  ' + err);
        }
    }

    // opens Details Panel if it is not loaded
    async openDetailsPanel() {
        let detailsPanel = new DetailsPanel();
        try {
            let result = await detailsPanel.isDetailsPanelLoaded();
            if (!result) {
                await this.clickOnDetailsPanelToggleButton();
                return await detailsPanel.isDetailsPanelLoaded();
            } else {
                console.log('Content wizard is opened and Details Panel is loaded');
            }
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_details_panel'));
            throw new Error(err);
        }
    }

    async clickOnDetailsPanelToggleButton() {
        try {
            await this.clickOnElement(this.detailsPanelToggleButton);
            return await this.pause(500);
        } catch (err) {
            throw new Error('Error when trying to open Details Panel in Wizard');
        }
    }

    async openVersionsHistoryPanel() {
        let wizardDetailsPanel = new DetailsPanel();
        let versionPanel = new VersionsWidget();
        await this.openDetailsPanel();
        await wizardDetailsPanel.openVersionHistory();
        return await versionPanel.waitForVersionsLoaded();
    }

    async openPublishReportWidget() {
        let wizardDetailsPanel = new DetailsPanel();
        await this.openDetailsPanel();
        await wizardDetailsPanel.openPublishReport();
    }

    async openDependenciesWidget() {
        try {
            let wizardDetailsPanel = new DetailsPanel();
            let wizardDependenciesWidget = new WizardDependenciesWidget();
            await this.openDetailsPanel();
            await wizardDetailsPanel.openDependencies();
            return await wizardDependenciesWidget.waitForWidgetLoaded();
        } catch (err) {
            // Workaround for issue with empty selector:
            await this.refresh();
            await this.pause(4000);
            let wizardDependenciesWidget = new WizardDependenciesWidget();
            let wizardDetailsPanel = new DetailsPanel();
            await wizardDetailsPanel.openDependencies();
            return await wizardDependenciesWidget.waitForWidgetLoaded
        }
    }

    waitForXdataTogglerVisible() {
        return this.waitForElementDisplayed(XPATH.xDataToggler, appConst.TIMEOUT_1).catch(err => {
            this.saveScreenshot('err_x-data_toogler');
            throw new Error("x-data toggler is not visible on the wizard page");
        })
    }

    waitForWizardStepPresent(stepName) {
        let stepXpath = XPATH.wizardStepByName(stepName);
        return this.waitForElementDisplayed(stepXpath, appConst.shortTimeout).catch(err => {
            console.log("Wizard step is not visible: " + err);
            return false;
        })
    }

    isWizardStepByTitlePresent(title) {
        let stepXpath = XPATH.wizardStepByTitle(title);
        return this.waitForElementDisplayed(stepXpath, appConst.shortTimeout).catch(err => {
            console.log("Wizard step is not visible: " + title);
            return false;
        })
    }

    async clickOnWizardStep(title) {
        try {
            let stepXpath = XPATH.wizardStepByTitle(title);
            await this.clickOnElement(stepXpath);
            return await this.pause(1000);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_'));
            throw new Error('Error when clicking on the wizard step ' + err);
        }
    }

    waitForWizardStepByTitleNotVisible(title) {
        let stepXpath = XPATH.wizardStepByTitle(title);
        return this.waitForElementNotDisplayed(stepXpath, appConst.shortTimeout).catch(err => {
            console.log('Wizard step is not visible: ' + title);
            return false;
        })
    }

    async clickOnXdataToggler() {
        try {
            await this.clickOnElement(XPATH.xDataToggler);
            return await this.pause(500);
        } catch (err) {
            await this.saveScreenshot('err_click_on_xdata_toggler');
            throw new Error("Error when clicking on x-data toggler " + err);
        }
    }

    async clickOnXdataTogglerByName(name) {
        try {
            await this.waitForElementDisplayed(XPATH.xDataTogglerByName(name), appConst.mediumTimeout);
            await this.clickOnElement(XPATH.xDataTogglerByName(name));
            return await this.pause(400);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_x_data');
            await this.saveScreenshot(screenshot);
            throw new Error('Error, clicking on X-data toggler, screenshot: ' + screenshot + "  " + err);
        }
    }

    //Gets titles of all x-data forms
    getXdataTitles() {
        let selector = "//div[contains(@id,'PanelStripHeader') and child::div[@class='x-data-toggler']]/span";
        return this.getTextInElements(selector).catch(err => {
            throw new Error("Error when getting title from x-data " + err);
        })
    }

    async hotKeyCloseWizard() {
        try {
            await this.pause(1000);
            await this.getBrowser().keys(['Alt', 'w']);
            await this.doSwitchToContentBrowsePanel();
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_hot_key');
            await this.saveScreenshot(screenshot);
            return await this.doSwitchToContentBrowsePanel();
        }
    }

    async hotKeySaveAndCloseWizard() {
        try {
            let status = await this.getBrowser().status();
            await this.getBrowser().keys(['Control', 'Enter']);
            await this.doSwitchToContentBrowsePanel();
            return await this.pause(500);
        } catch (err) {
            console.log('Save and close the wizard ' + err);
            await this.doSwitchToContentBrowsePanel();
        }
    }

    async doSwitchToContentBrowsePanel() {
        try {
            console.log('testUtils:switching to Content Browse panel...');
            let browsePanel = new BrowsePanel();
            await this.getBrowser().switchWindow('Content Studio - Enonic XP Admin');
            console.log("switched to content browse panel...");
            return await browsePanel.waitForGridLoaded(appConst.longTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_switch');
            await this.saveScreenshot(screenshot);
            throw new Error('Error when switching to Content Studio App ' + err);
        }
    }

    async waitForShowContextPanelButtonDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.detailsPanelToggleButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot('err_show_context_panel_button');
            throw new Error(err);
        }
    }

    async clickOnShowComponentViewToggler() {
        try {
            await this.waitForElementDisplayed(this.showComponentViewToggler, appConst.mediumTimeout);
            await this.waitForElementEnabled(this.showComponentViewToggler, appConst.mediumTimeout);
            await this.clickOnElement(this.showComponentViewToggler);
            return await this.pause(500);
        } catch (err) {
            await this.saveScreenshot('err_click_on_show_component_view');
            throw new Error("Error when clicking on 'Show Component View!'" + err);
        }
    }

    async clickOnComponentViewToggler() {
        try {
            await this.waitForElementDisplayed(this.componentViewToggler, appConst.mediumTimeout);
            await this.clickOnElement(this.componentViewToggler);
            return await this.pause(300);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_componentView_toggler')
            await this.saveScreenshot(screenshot);
            throw new Error("Error when clicking on 'Show Component View!' button, screenshot:" + screenshot + " " + err);
        }
    }

    async waitForHideComponentViewTogglerDisplayed() {
        try {
            return await this.waitForElementDisplayed(this.hideComponentViewToggler, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot('err_hide_component_view_not_displayed');
            throw new Error("'Hide Component View!' button should appear: " + err);
        }
    }

    async waitForHidePageEditorTogglerButtonDisplayed() {
        try {
            return await this.waitForElementDisplayed(XPATH.hidePageEditorTogglerButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot('err_hide_page_editor_button_not_displayed');
            throw new Error("'Hide Page Editor' button should be displayed : " + err);
        }
    }

    async waitForShowPageEditorTogglerButtonDisplayed() {
        try {
            return await this.waitForElementDisplayed(XPATH.showPageEditorTogglerButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot('err_show_page_editor_button_not_displayed');
            throw new Error("'Show Page Editor' button should be displayed : " + err);
        }
    }

    async clickOnHideComponentViewToggler() {
        try {
            await this.waitForHideComponentViewTogglerDisplayed();
            await this.clickOnElement(this.hideComponentViewToggler);
        } catch (err) {
            await this.saveScreenshot('err_click_on_hide_component_view');
            throw new Error("Error when clicking on 'Hide Component View' " + err);
        }
        return await this.pause(300);
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(this.saveButton, appConst.longTimeout);
            await this.waitForSpinnerNotVisible(appConst.longTimeout);
            return await this.pause(200);
        } catch (err) {
            await this.saveScreenshot(contentBuilder.generateRandomName('err_open_wizard'));
            throw new Error("Content wizard was not loaded! " + err);
        }
    }

    //exception will be thrown if Save button is disabled after 3 seconds
    async waitForSaveButtonEnabled() {
        try {
            await this.waitForSaveButtonVisible();
            return await this.waitForElementEnabled(this.saveButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_save_button');
            await this.saveScreenshot(screenshot);
            throw new Error("Save button should be enabled in the wizard, screenshot: " + screenshot + "  " + err);
        }
    }

    async waitForSaveButtonDisabled() {
        try {
            await this.waitForElementDisabled(this.saveButton, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName("err_save_button");
            await this.saveScreenshot(screenshot);
            throw new Error("Content Wizard - Save button should be disabled! Screenshot:" + screenshot + "  " + err);
        }
    }

    waitForSaveButtonVisible() {
        return this.waitForElementDisplayed(this.saveButton, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_save_button');
            throw new Error('Save button is not visible ' + err);
        });
    }

    async waitForSavedButtonVisible() {
        try {
            await this.waitForElementDisplayed(this.savedButton, appConst.mediumTimeout);
            return await this.waitForElementDisabled(this.savedButton, appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot('err_saved_button_not_visible');
            throw new Error("Saved button is not visible or it is not disabled " + err);
        }
    }

    switchToLiveEditFrame() {
        return this.switchToFrame(XPATH.liveEditFrame);
    }

    async getLiveFramePosition() {
        let el = await this.findElement(XPATH.liveEditFrame);
        let xValue = parseInt(await el.getLocation('x'));
        let yValue = parseInt(await el.getLocation('y'));
        return {x: xValue, y: yValue};
    }

    typeDisplayName(displayName) {
        return this.typeTextInInput(this.displayNameInput, displayName);
    }

    typeInPathInput(path) {
        return this.typeTextInInput(this.pathInput, path);
    }

    getDisplayName() {
        return this.getTextInInput(this.displayNameInput);
    }

    getPath() {
        return this.getTextInInput(this.pathInput);
    }

    clearDisplayNameInput() {
        return this.clearInputText(this.displayNameInput);
    }

    async waitAndClickOnSave() {
        try {
            await this.waitForSaveButtonEnabled();
            await this.clickOnElement(this.saveButton);
            await this.waitForSavingButtonNotVisible();
            return await this.pause(1200);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_save"));
            throw new Error('Error in waitAndClickOnSave: ' + err);
        }
    }

    waitForSavingButtonNotVisible() {
        return this.waitForElementNotDisplayed(this.savingButton, appConst.longTimeout);
    }

    async clickOnArchiveButton() {
        try {
            await this.waitForArchiveButtonEnabled();
            return await this.clickOnElement(this.archiveButton);
        } catch (err) {
            this.saveScreenshot('err_delete_wizard');
            throw new Error('Error when clicking on Delete button ' + err);
        }
    }

    //clicks on 'Publish...' button
    async clickOnPublishButton() {
        try {
            await this.waitForElementDisplayed(this.publishButton, appConst.mediumTimeout);
            await this.waitForElementEnabled(this.publishButton, appConst.mediumTimeout);
            await this.clickOnElement(this.publishButton);
            let contentPublishDialog = new ContentPublishDialog();
            await contentPublishDialog.waitForDialogOpened();
            return await contentPublishDialog.waitForSpinnerNotVisible(appConst.mediumTimeout);
        } catch (err) {
            this.saveScreenshot('err_when_click_on_publish_button');
            throw new Error('Error when Publish button has been clicked ' + err);
        }
    }

    //Click on Publish... button on toolbar, then clicks on Publish Now button on the modal dialog
    async doPublish() {
        await this.clickOnPublishButton();
        let contentPublishDialog = new ContentPublishDialog();
        await contentPublishDialog.waitForDialogOpened();
        await contentPublishDialog.clickOnPublishNowButton();
        return await contentPublishDialog.waitForDialogClosed();
    }

    async openPublishMenu() {
        await this.clickOnPublishMenuDropdownHandle();
        await this.pause(300);
    }

    async waitForPublishMenuItemDisabled(menuItem) {
        let selector = XPATH.toolbar + XPATH.publishMenuItemByName(menuItem);
        return await this.waitForAttributeHasValue(selector, 'class', 'disabled');
    }

    async waitForPublishMenuItemEnabled(menuItem) {
        let selector = XPATH.toolbar + XPATH.publishMenuItemByName(menuItem);
        return await this.waitForAttributeNotIncludesValue(selector, 'class', 'disabled');
    }

    async isContentInvalid() {
        try {
            let locator = this.workflowIconAndValidation;
            let result = await this.getAttribute(locator, 'class');
            return result.includes("invalid");
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_wizard_validation');
            await this.saveScreenshot(screenshot);
            throw new Error('error, content validation screenshot: ' + screenshot + "  " + err);
        }
    }

    async waitUntilInvalidIconAppears() {
        try {
            let locator = this.workflowIconAndValidation;
            await this.waitUntilInvalid(locator);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_wizard_validation');
            await this.saveScreenshot(screenshot);
            throw new Error('Validation Error: invalid-icon did not appear in content-wizard screenshot: ' + screenshot + " " + err);
        }
    }

    waitUntilInvalidIconDisappears() {
        let locator = this.workflowIconAndValidation;
        return this.getBrowser().waitUntil(() => {
            return this.getAttribute(locator, 'class').then(result => {
                return !result.includes('invalid');
            })
        }, {
            timeout: appConst.mediumTimeout,
            timeoutMsg: "Validation Error: Red icon is still displayed in the wizard after 3 seconds"
        });
    }

    async typeSettings(settings) {
        let propertiesWidget = new PropertiesWidget();
        let editSettingsDialog = new EditSettingsDialog();
        if (settings.language) {
            await propertiesWidget.clickOnEditSettingsButton();
            await editSettingsDialog.waitForLoaded();
            await editSettingsDialog.filterOptionsAndSelectLanguage(settings.language);
            await editSettingsDialog.clickOnApplyButton();
        }
    }

    async doUnlockLiveEditor() {
        await this.doOpenItemViewContextMenu();
        await this.saveScreenshot(appConst.generateRandomName('unlock_context_menu'));
        return await this.clickOnCustomizeMenuItem();
    }

    async doOpenItemViewContextMenu() {
        try {
            let selector = `//div[contains(@id,'Panel') and contains(@class,'frame-container')]`;
            await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
            await this.clickOnElement(selector);
            await this.switchToLiveEditFrame();
            await this.waitForElementDisplayed(XPATH.itemViewContextMenu, appConst.mediumTimeout);
            return await this.pause(300);
        } catch (err) {
            await this.saveScreenshot('err_customize_menu_item');
            throw  new Error(`'Customize Page' menu item is not displayed` + err);
        }
    }

    // wait for 'Customize Page' context menu item
    async clickOnCustomizeMenuItem() {
        let locator = XPATH.itemViewContextMenu + "//dl//dt[text()='Customize Page']";
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        await this.clickOnElement(locator);
        return await this.pause(1000);
    }

    async doFilterControllersAndClickOnOption(pageControllerDisplayName) {
        try {
            let optionSelector = lib.slickRowByDisplayName(`//div[contains(@id,'PageDescriptorDropdown')]`, pageControllerDisplayName);
            await this.waitForElementDisplayed(this.controllerOptionFilterInput, appConst.longTimeout);
            await this.typeTextInInput(this.controllerOptionFilterInput, pageControllerDisplayName);
            await this.waitForElementDisplayed(optionSelector, appConst.mediumTimeout);
            await this.clickOnElement(optionSelector);
            return await this.pause(500);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_select_controller');
            await this.saveScreenshot(screenshot);
            throw new Error('Controller selector - Error when selecting the option, screenshot: ' + screenshot + ' ' + err);
        }
    }

    isPageControllerFilterInputClickable() {
        return this.isClickable(this.controllerOptionFilterInput);
    }

    //Select a page descriptor and wait for Context Window is loaded
    async selectPageDescriptor(pageControllerDisplayName, checkContextPanel) {
        await this.doFilterControllersAndClickOnOption(pageControllerDisplayName);
        if (typeof checkContextPanel === 'undefined' || checkContextPanel) {
            await this.waitForContextWindowVisible();
        }
        await this.pause(500);
    }

    switchToMainFrame() {
        return this.getBrowser().switchToParentFrame();
    }

    async waitForControllerOptionFilterInputVisible() {
        try {
            await this.waitForElementDisplayed(this.controllerOptionFilterInput, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_controller_filter_input');
            await this.saveScreenshot(screenshot);
            throw new Error("Controller selector should be displayed, screenshot:" + screenshot + " " + err);
        }
    }

    async waitForControllerOptionFilterInputNotVisible() {
        try {
            await this.waitForElementNotDisplayed(this.controllerOptionFilterInput, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_controller_selector');
            await this.saveScreenshot(screenshot);
            throw new Error("Controller selector should not be visible, screenshot: " + screenshot + " " + err);
        }
    }

    async typeData(content) {
        try {
            let contentStepForm = new ContentStepForm();
            await this.waitForElementDisplayed(this.displayNameInput, appConst.shortTimeout);
            await this.typeDisplayName(content.displayName);
            if (content.data != null) {
                await contentStepForm.type(content.data, content.contentType);
            }
            if (content.settings != null) {
                await this.typeSettings(content.settings);
            }
            return await this.pause(500);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_site'));
            throw new Error(err);
        }
    }

    async clickOnPublishMenuDropdownHandle() {
        try {
            await this.waitForElementDisplayed(this.publishDropDownHandle, appConst.mediumTimeout);
            await this.clickOnElement(this.publishDropDownHandle);
            return await this.pause(400);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_click_on_dropdown'));
            throw new Error("Error when clicking on Publish dropdown handle " + err);
        }
    }

    clickOnUnpublishMenuItem() {
        return this.clickOnPublishMenuDropdownHandle().then(() => {
            return this.waitForElementDisplayed(this.unpublishMenuItem, appConst.mediumTimeout);
        }).then(() => {
            return this.clickOnElement(this.unpublishMenuItem);
        }).catch(err => {
            throw new Error("Error when unpublishing the content! " + err);
        });
    }

    clickOnMinimizeEditIcon() {
        let minimizeEditIcon = XPATH.container + "//div[@class='minimize-edit']";
        return this.clickOnElement(minimizeEditIcon).catch(err => {
            this.saveScreenshot('err_click_on_minimize_icon');
            throw new Error(err);
        });
    }

    hotKeyDelete() {
        return this.getBrowser().keys(['Control', 'Delete']);
    }

    hotKeySave() {
        return this.getBrowser().status().then(status => {
            return this.getBrowser().keys(['Control', 's']);
        }).then(() => {
            return this.pause(1000);
        })
    }

    hotKeyPublish() {
        return this.getBrowser().keys(['Control', 'Alt', 'p']);
    }

    waitForShowPublishMenuButtonVisible() {
        return this.waitForElementDisplayed(this.publishDropDownHandle, appConst.mediumTimeout).catch(err => {
            throw new Error("Wizard - drop down handle in Publish menu is not visible!" + err);
        })
    }

    async waitForMarkAsReadyButtonVisible() {
        let selector = XPATH.container + XPATH.markAsReadyButton;
        return await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
    }

    waitForOpenRequestButtonVisible() {
        let selector = XPATH.container + XPATH.openRequestButton;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout);
    }

    async clickOnOpenRequestButton() {
        try {
            await this.waitForOpenRequestButtonVisible();
            return await this.clickOnElement(XPATH.container + XPATH.openRequestButton);
        } catch (err) {
            this.saveScreenshot('err_when_click_on_open_req_button');
            throw new Error('Error when Open Request button has been clicked ' + err);
        }
    }

    async getContentStatus() {
        let result = await this.getDisplayedElements(XPATH.container + XPATH.status);
        return await result[0].getText();
    }

    waitForContentStatus(expectedStatus) {
        let selector = XPATH.container +
                       `//div[contains(@class,'content-status-wrapper')]/span[contains(@class,'status') and text()='${expectedStatus}']`;
        let message = "Element still not displayed! timeout is " + appConst.mediumTimeout + "  " + selector;
        return this.getBrowser().waitUntil(() => {
            return this.isElementDisplayed(selector);
        }, appConst.mediumTimeout, message);
    }

    async isPublishMenuItemPresent(menuItem) {
        try {
            await this.waitForShowPublishMenuButtonVisible();
            await this.clickOnElement(this.publishDropDownHandle);
            await this.pause(2000);
            let selector = XPATH.publishMenuItemByName(menuItem);
            let result = await this.findElements(selector);
            return result.length > 0;
        } catch (err) {
            throw new Error('Error when open the publish menu: ' + err);
        }
    }

    async openPublishMenuSelectItem(menuItem) {
        try {
            await this.waitForShowPublishMenuButtonVisible();
            await this.clickOnElement(this.publishDropDownHandle);
            await this.pause(500);
            let selector = XPATH.publishMenuItemByName(menuItem);
            await this.waitForElementEnabled(selector, appConst.shortTimeout);
            await this.clickOnElement(selector);
            return await this.pause(300);
        } catch (err) {
            this.saveScreenshot('err_click_publish_menuItem');
            throw new Error('error when try to click on publish menu item, ' + err);
        }
    }

    //Clicks on publish-menu dropdown handler then click on Publish... menu item
    async openPublishMenuAndPublish() {
        let contentPublishDialog = new ContentPublishDialog();
        let contentWizardPanel = new ContentWizardPanel();
        //1. Click on Publish... menu item
        await contentWizardPanel.openPublishMenuSelectItem(appConst.PUBLISH_MENU.PUBLISH);
        //2. Wait for modal dialog opened
        await contentPublishDialog.waitForDialogOpened();
        //3. Click on Publish Now button
        await contentPublishDialog.clickOnPublishNowButton();
        await contentPublishDialog.waitForDialogClosed();
    }

    async openPublishMenuAndCreateRequestPublish(changes, assignees) {
        let createRequestPublishDialog = new CreateRequestPublishDialog();
        let contentWizardPanel = new ContentWizardPanel();
        await contentWizardPanel.openPublishMenuSelectItem(appConst.PUBLISH_MENU.REQUEST_PUBLISH);
        await createRequestPublishDialog.waitForDialogLoaded();
        await createRequestPublishDialog.clickOnNextButton();
        await createRequestPublishDialog.typeInChangesInput(changes);
        return await createRequestPublishDialog.clickOnCreateRequestButton();
    }

    async clickOnMarkAsReadyButton() {
        try {
            let selector = XPATH.container + XPATH.markAsReadyButton;
            await this.waitForMarkAsReadyButtonVisible();
            await this.clickOnElement(selector);
            return await this.pause(1000);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_mark_as_ready_btn');
            await this.saveScreenshot(screenshot);
            throw new Error("Error in clickOnMarkAsReadyButton, screenshot:" + screenshot + " " + err);
        }
    }

    async clickOnUnpublishButton() {
        let selector = XPATH.container + XPATH.unpublishButton;
        await this.waitForUnpublishButtonDisplayed();
        await this.clickOnElement(selector);
        let unpublishDialog = new ContentUnpublishDialog();
        await unpublishDialog.waitForDialogOpened();
        return unpublishDialog;
    }

    waitForUnpublishButtonDisplayed() {
        let selector = XPATH.container + XPATH.unpublishButton;
        return this.waitForElementDisplayed(selector, appConst.longTimeout);
    }

    async waitForPublishButtonDisplayed() {
        try {
            let selector = XPATH.container + XPATH.publishButton;
            return await this.waitForElementDisplayed(selector, appConst.shortTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_publish_btn'));
            throw new Error("Content Wizard - 'Publish...' button should be present" + err);
        }
    }

    // Wait for 'Create Issue' button gets default action in the Publish menu:
    async waitForCreateIssueButtonDisplayed() {
        try {
            let selector = XPATH.container + XPATH.publishMenuButton + XPATH.createIssueButton;
            return await this.waitForElementDisplayed(selector, appConst.shortTimeout);
        } catch (err) {
            this.saveScreenshot("err_publish_menu_default_action");
            throw new Error("'Create Issue...' button should be default action in 'Publish Menu' in Wizard page.  " + err);
        }
    }

    // wait for Workflow icon is not displayed in the toolbar
    async waitForStateIconNotDisplayed() {
        try {
            let selector = XPATH.toolbar + XPATH.toolbarStateIcon;
            return await this.waitForElementNotDisplayed(selector, appConst.TIMEOUT_4);
        } catch (err) {
            this.saveScreenshot('err_workflow_state_should_not_be_visible');
            throw new Error("Workflow state should be not visible!" + err);
        }
    }

    // Gets workflow state in the wizard toolbar or null
    async getContentWorkflowState() {
        let locator = this.workflowIconAndValidation;
        await this.waitForElementDisplayed(locator, appConst.shortTimeout);
        let result = await this.getAttribute(locator, 'title');
        return result;
    }

    async clickOnPageEditorToggler() {
        try {
            await this.waitForElementDisplayed(this.pageEditorTogglerButton, appConst.mediumTimeout);
            await this.clickOnElement(this.pageEditorTogglerButton);
            return await this.pause(1000);
        } catch (err) {
            throw new Error('Page Editor toggler: ' + err);
        }
    }

    waitForPageEditorTogglerDisplayed() {
        return this.waitForElementDisplayed(this.pageEditorTogglerButton, appConst.mediumTimeout);
    }

    async getProjectDisplayName() {
        let selector = XPATH.toolbar + "//div[contains(@class,'project-info')]" + lib.H6_DISPLAY_NAME;
        await this.waitForElementDisplayed(selector, appConst.shortTimeout);
        return await this.getText(selector);
    }

    isDisplayNameInputClickable() {
        return this.isClickable(this.displayNameInput);
    }

    waitForDuplicateButtonEnabled() {
        return this.waitForElementEnabled(this.duplicateButton, appConst.mediumTimeout);
    }

    async waitForDuplicateButtonDisabled() {
        try {
            await this.waitForElementDisplayed(this.duplicateButton, appConst.mediumTimeout);
            return await this.waitForElementDisabled(this.duplicateButton, appConst.mediumTimeout);
        } catch (err) {
            this.saveScreenshot('err_duplicate_button_disabled');
            throw Error('Duplicate button should be disabled, timeout: ' + appConst.mediumTimeout + 'ms')
        }
    }

    async waitForArchiveButtonDisabled() {
        await this.waitForElementDisplayed(this.archiveButton, appConst.mediumTimeout);
        return await this.waitForElementDisabled(this.archiveButton, appConst.mediumTimeout);
    }

    waitForArchiveButtonEnabled() {
        return this.waitForElementEnabled(this.archiveButton, appConst.mediumTimeout);
    }

    waitForArchiveButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.archiveButton, appConst.mediumTimeout);
    }

    async clickOnPreviewButton() {
        try {
            await this.waitForElementEnabled(this.previewButton, appConst.mediumTimeout);
            await this.clickOnElement(this.previewButton);
            return await this.pause(2000);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_preview_button');
            await this.saveScreenshot(screenshot);
            throw new Error('Error when clicking on Preview button, screenshot:' + screenshot + " " + err);
        }
    }

    waitForPreviewButtonDisplayed() {
        return this.waitForElementDisplayed(this.previewButton, appConst.mediumTimeout);
    }

    waitForPreviewButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.previewButton, appConst.mediumTimeout);
    }

    waitForValidationPathMessageDisplayed() {
        let locator = XPATH.wizardHeader + "//span[@class='path-error']";
        return this.waitForElementDisplayed(locator, appConst.mediumTimeout);
    }

    async clickOnModifyPathButton() {
        await this.waitForElementDisplayed(this.modifyPathButton, appConst.mediumTimeout);
        await this.clickOnElement(this.modifyPathButton);
        let renamePublishedContentDialog = new RenamePublishedContentDialog();
        await renamePublishedContentDialog.waitForDialogLoaded();
        return renamePublishedContentDialog;
    }

    waitForModifyPathButtonDisplayed() {
        return this.waitForElementDisplayed(this.modifyPathButton, appConst.mediumTimeout);
    }

    waitForModifyPathButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.modifyPathButton, appConst.mediumTimeout);
    }

    async openLayersWidget() {
        let detailsPanel = new DetailsPanel();
        let wizardLayersWidget = new WizardLayersWidget();
        await this.openDetailsPanel();
        await detailsPanel.openLayers();
        await wizardLayersWidget.waitForWidgetLoaded();
        return wizardLayersWidget;
    }

    async openDetailsWidget() {
        let detailsPanel = new DetailsPanel();
        await this.openDetailsPanel();
        await detailsPanel.openDetailsWidget();
    }

    async waitForResetButtonDisplayed() {
        try {
            return this.waitForElementDisplayed(this.resetButton, appConst.longTimeout);
        } catch (err) {
            let screenshot = appConst.generateRandomName("err_reset_button");
            await this.saveScreenshot(screenshot);
            throw new Error("Reset button is not displayed in the content wizard, screenshot:" + screenshot + " " + err);
        }
    }

    waitForResetButtonNotDisplayed() {
        return this.waitForElementNotDisplayed(this.resetButton, appConst.longTimeout);
    }

    async clickOnResetButton() {
        await this.waitForElementDisplayed(this.resetButton, appConst.longTimeout);
        return await this.clickOnElement(this.resetButton);
    }

    async clickOnResetAndWaitForConfirmationDialog() {
        await this.waitForElementDisplayed(this.resetButton, appConst.longTimeout);
        await this.clickOnElement(this.resetButton);
        let dialog = new ConfirmationDialog();
        await dialog.waitForOpened();
        return dialog;
    }

    async getPageEditorWidth() {
        let widthProperty = await this.getCSSProperty(XPATH.liveEditFrame, "width");
        return widthProperty.value;
    }

    async getPageEditorHeight() {
        let heightProperty = await this.getCSSProperty(XPATH.liveEditFrame, "height");
        return heightProperty.value;
    }

    async waitForDisplayNameInputFocused() {
        try {
            let message = "Display Name input is not focused in " + appConst.mediumTimeout;
            await this.getBrowser().waitUntil(async () => {
                return await this.isFocused(this.displayNameInput);
            }, {timeout: appConst.mediumTimeout, timeoutMsg: message});
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName('err_focused'));
            throw new Error(err + "Display Name input was not focused in " + appConst.mediumTimeout);
        }
    }

    async isLiveEditLocked() {
        await this.switchToLiveEditFrame();
        let shaderElement = await this.findElement(XPATH.shaderPage);
        let style = await shaderElement.getAttribute("style");
        return !style.includes("display: none");
    }

    async clickOnGoToGridButton() {
        await this.waitForElementDisplayed(this.goToGridButton, appConst.mediumTimeout);
        await this.clickOnElement(this.goToGridButton);
        return await this.pause(300);
    }

    async getCollaborationUserCompactName() {
        try {
            let locator = XPATH.toolbar + "//div[contains(@id,'CollaborationEl')]//div[contains(@id,'PrincipalViewerCompact')]/span";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.getTextInElements(locator);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_collaboration_icon"));
            throw new Error("Collaboration element should be displayed in the wizard toolbar: " + err);
        }
    }

    getMessageInLiveFormPanel() {
        let locator = XPATH.pagePlaceholderInfoBlock1;
        return this.getText(locator);
    }

    async waitForErrorMessageInLiveFormPanel(message) {
        let locator = `//div[contains(@id,'PagePlaceholderInfoBlock')]//div[contains(@class,'page-placeholder-info-line1') and contains(.,'${message}')]`;
        return await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
    }

    waitForShowChangesButtonDisplayed() {
        return this.waitForElementDisplayed(this.showChangesToolbarButton, appConst.mediumTimeout);
    }

    async clickOnShowChangesToolbarButton() {
        await this.waitForShowChangesButtonDisplayed();
        await this.clickOnElement(this.showChangesToolbarButton);
    }
}

module.exports = ContentWizardPanel;
