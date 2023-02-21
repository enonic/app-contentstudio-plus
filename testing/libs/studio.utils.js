/**
 * Created on 12/2/2017.
 */
const LauncherPanel = require('../page_objects/launcher.panel');
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const BrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const FilterPanel = require("../page_objects/browsepanel/content.filter.panel");
const appConst = require("./app_const");
const lib = require("./elements");
const NewContentDialog = require('../page_objects/browsepanel/new.content.dialog');
const ContentWizardPanel = require('../page_objects/wizardpanel/content.wizard.panel');
const webDriverHelper = require("./WebDriverHelper");
const IssueListDialog = require('../page_objects/issue/issue.list.dialog');
const CreateTaskDialog = require('../page_objects/issue/create.task.dialog');
const InsertLinkDialog = require('../page_objects/wizardpanel/insert.link.modal.dialog.cke');
const ContentPublishDialog = require('../page_objects/content.publish.dialog');
const BrowseDetailsPanel = require('../page_objects/browsepanel/detailspanel/browse.details.panel');
const BrowseDependenciesWidget = require('../page_objects/browsepanel/detailspanel/browse.dependencies.widget');
const ContentUnpublishDialog = require('../page_objects/content.unpublish.dialog');
const CreateRequestPublishDialog = require('../page_objects/issue/create.request.publish.dialog');
const ProjectSelectionDialog = require('../page_objects/project/project.selection.dialog');
const ArchiveBrowsePanel = require('../page_objects/archive/archive.browse.panel');
const UserBrowsePanel = require('../page_objects/users/userbrowse.panel');
const PrincipalFilterPanel = require('../page_objects/users/principal.filter.panel');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const SettingsBrowsePanel = require('../page_objects/project/settings.browse.panel');
const BrowseLayersWidget = require('../page_objects/browsepanel/detailspanel/browse.layers.widget');
const BrowseVariantsWidget = require('../page_objects/browsepanel/detailspanel/browse.variants.widget');
const fs = require('fs');
const path = require('path');
const addContext = require('mochawesome/addContext');

module.exports = {
    getBrowser() {
        if (typeof browser !== 'undefined') {
            return browser;
        } else {
            return webDriverHelper.browser;
        }
    },
    setTextInCKE: function (id, text) {
        let script = `CKEDITOR.instances['${id}'].setData('${text}')`;
        return webDriverHelper.browser.execute(script).then(() => {
            let script2 = `CKEDITOR.instances['${id}'].fire('change')`;
            return webDriverHelper.browser.execute(script2);
        })
    },
    async waitForElementDisplayed(selector, ms) {
        let element = await webDriverHelper.browser.$(selector);
        return await element.waitForDisplayed(ms);
    },
    async clickOnElement(selector) {
        let el = await webDriverHelper.browser.$(selector);
        await el.waitForDisplayed(1500);
        return await el.click();
    },
    async getText(selector) {
        let el = await webDriverHelper.browser.$(selector);
        await el.waitForDisplayed(1500);
        return await el.getText();
    },

    async isElementDisplayed(selector) {
        let el = await webDriverHelper.browser.$(selector);
        return await el.isDisplayed();
    },
    getPageSource() {
        return webDriverHelper.browser.getPageSource();
    },

    async switchToFrameBySrc(src) {
        try {
            let selector = `//iframe[contains(@src,'${src}')]`;
            let el = await webDriverHelper.browser.$(selector);
            await el.waitForDisplayed(1500);
            return await webDriverHelper.browser.switchToFrame(el);
        } catch (err) {
            throw new Error('Error when switch to frame  ' + err);
        }
    },
    getTitle() {
        return webDriverHelper.browser.getTitle();
    },

    getTextInCKE: function (id) {
        let script = `return CKEDITOR.instances['${id}'].getData()`;
        return webDriverHelper.browser.execute(script);
    },
    scrollViewPort(viewportElement, step) {
        return webDriverHelper.browser.execute("arguments[0].scrollTop=arguments[1]", viewportElement, step);
    },

    async insertContentLinkInCke(text, contentDisplayName) {
        let insertLinkDialog = new InsertLinkDialog();
        await insertLinkDialog.typeText(text);
        await insertLinkDialog.selectTargetInContentTab(contentDisplayName);
        this.saveScreenshot('content_link_dialog');
        await insertLinkDialog.clickOnInsertButton();
        return await insertLinkDialog.pause(700);
    },
    doCloseCurrentBrowserTab: function () {
        return webDriverHelper.browser.getTitle().then(title => {
            if (title != 'Enonic XP Home') {
                return webDriverHelper.browser.closeWindow();
            }
        })
    },
    async openIssuesListDialog() {
        let browsePanel = new BrowsePanel();
        let issueListDialog = new IssueListDialog();
        await browsePanel.clickOnShowIssuesListButton();
        await issueListDialog.waitForDialogOpened();
        return await issueListDialog.pause(300);
    },
    async openCreateTaskDialog() {
        try {
            let browsePanel = new BrowsePanel();
            let createTaskDialog = new CreateTaskDialog();
            let issueListDialog = new IssueListDialog();
            await browsePanel.clickOnShowIssuesListButton();
            await issueListDialog.waitForDialogOpened();
            await issueListDialog.clickOnNewTaskButton();
            return await createTaskDialog.waitForDialogLoaded();
        } catch (err) {
            throw new Error("Error when opening Create Task Dialog " + err);
        }
    },
    async createPublishRequest(text) {
        try {
            let browsePanel = new BrowsePanel();
            let createRequestPublishDialog = new CreateRequestPublishDialog();
            await browsePanel.openPublishMenuSelectItem(appConst.PUBLISH_MENU.REQUEST_PUBLISH);
            await createRequestPublishDialog.waitForDialogLoaded();
            await createRequestPublishDialog.pause(300);
            await createRequestPublishDialog.clickOnNextButton();
            await createRequestPublishDialog.typeInChangesInput(text);
            return await createRequestPublishDialog.clickOnCreateRequestButton();
        } catch (err) {
            throw new Error("Error when create Publish Request " + err);
        }
    },
    async openPublishMenuAndClickOnCreateTask() {
        let browsePanel = new BrowsePanel();
        let createTaskDialog = new CreateTaskDialog();
        await browsePanel.openPublishMenuAndClickOnCreateTask();
        return await createTaskDialog.waitForDialogLoaded();
    },
    async openBrowseDetailsPanel() {
        let browsePanel = new BrowsePanel();
        let browseDetailsPanel = new BrowseDetailsPanel();
        let result = await browseDetailsPanel.isPanelVisible();
        if (!result) {
            await browsePanel.clickOnDetailsPanelToggleButton();
        }
        await browseDetailsPanel.waitForDetailsPanelLoaded();
        await browsePanel.waitForSpinnerNotVisible(appConst.TIMEOUT_5);
        return await browsePanel.pause(1000);
    },
    async openContentWizard(contentType) {
        let browsePanel = new BrowsePanel();
        let newContentDialog = new NewContentDialog();
        let contentWizardPanel = new ContentWizardPanel();
        await browsePanel.waitForNewButtonEnabled(appConst.mediumTimeout);
        await browsePanel.clickOnNewButton();
        await newContentDialog.waitForOpened();
        await newContentDialog.clickOnContentType(contentType);
        //Switch to the new wizard:
        await this.doSwitchToNewWizard();
        await contentWizardPanel.waitForOpened();
        return await contentWizardPanel.waitForDisplayNameInputFocused();
    },
    async selectAndOpenContentInWizard(contentName, checkFocused) {
        let contentWizardPanel = new ContentWizardPanel();
        let browsePanel = new BrowsePanel();
        await this.findAndSelectItem(contentName);
        await browsePanel.clickOnEditButton();
        await this.doSwitchToNewWizard();
        await contentWizardPanel.waitForOpened();
        //timeout = ms === undefined ? appConst.longTimeout : ms;
        let waitForFocused = checkFocused === undefined ? true : checkFocused;
        if (waitForFocused) {
            await contentWizardPanel.waitForDisplayNameInputFocused();
        }
        return contentWizardPanel;
    },

    async selectByDisplayNameAndOpenContent(displayName, checkFocused) {
        let contentWizardPanel = new ContentWizardPanel();
        let browsePanel = new BrowsePanel();
        await this.findAndSelectItemByDisplayName(displayName);
        await browsePanel.clickOnEditButton();
        await this.doSwitchToNewWizard();
        await contentWizardPanel.waitForOpened();
        //timeout = ms === undefined ? appConst.longTimeout : ms;
        let waitForFocused = checkFocused === undefined ? true : checkFocused;
        if (waitForFocused) {
            await contentWizardPanel.waitForDisplayNameInputFocused();
        }
        return contentWizardPanel;
    },
    async selectContentAndClickOnLocalize(contentName) {
        let contentWizardPanel = new ContentWizardPanel();
        let browsePanel = new BrowsePanel();
        await this.findAndSelectItem(contentName);
        await browsePanel.clickOnLocalizeButton();
        await this.doSwitchToNewWizard();
        await contentWizardPanel.waitForOpened();
        await contentWizardPanel.waitForDisplayNameInputFocused();
        return contentWizardPanel;
    },

    async doAddShortcut(shortcut) {
        let contentWizardPanel = new ContentWizardPanel();
        //Open new shortcut-wizard:
        await this.openContentWizard(appConst.contentTypes.SHORTCUT);
        await contentWizardPanel.typeData(shortcut);
        await contentWizardPanel.waitAndClickOnSave();
        return await this.doCloseWizardAndSwitchToGrid();
    },
    async doAddReadyFolder(folder) {
        let contentWizardPanel = new ContentWizardPanel();
        await this.openContentWizard(appConst.contentTypes.FOLDER);
        await contentWizardPanel.typeData(folder);
        await contentWizardPanel.clickOnMarkAsReadyButton();
        await this.doCloseWizardAndSwitchToGrid();
        return await webDriverHelper.browser.pause(1000);
    },
    async doAddFolder(folder) {
        let contentWizardPanel = new ContentWizardPanel();
        //1. Open the folder-wizard:
        await this.openContentWizard(appConst.contentTypes.FOLDER);
        await contentWizardPanel.typeData(folder);
        //2. Save the folder:
        await contentWizardPanel.waitAndClickOnSave();
        //3.Close the wizard:
        await this.doCloseWizardAndSwitchToGrid();
        return await webDriverHelper.browser.pause(1000);
    },
    doCloseWizardAndSwitchToGrid: function () {
        return this.doCloseCurrentBrowserTab().then(() => {
            return this.doSwitchToContentBrowsePanel();
        });
    },
    async doAddSite(site, noControllers) {
        let contentWizardPanel = new ContentWizardPanel();
        //1. Open new site-wizard:
        await this.openContentWizard(appConst.contentTypes.SITE);
        await contentWizardPanel.typeData(site);
        //2. Type the data and save:
        if (site.data.controller) {
            await contentWizardPanel.selectPageDescriptor(site.data.controller);
        }
        if (noControllers) {
            await contentWizardPanel.waitAndClickOnSave();
        }
        await this.doCloseCurrentBrowserTab();
        await this.doSwitchToContentBrowsePanel();
        return await webDriverHelper.browser.pause(1000);

    },
    async doAddReadySite(site) {
        let contentWizardPanel = new ContentWizardPanel();
        await this.openContentWizard(appConst.contentTypes.SITE);
        await contentWizardPanel.typeData(site);

        if (site.data.controller) {
            await contentWizardPanel.selectPageDescriptor(site.data.controller);
        } else {
            await contentWizardPanel.clickOnMarkAsReadyButton();
        }
        await this.doCloseCurrentBrowserTab();
        await this.doSwitchToContentBrowsePanel();
        return await webDriverHelper.browser.pause(1000);
    },
    doOpenSiteWizard: function () {
        return this.openContentWizard(appConst.contentTypes.SITE);
    },
    async doOpenPageTemplateWizard(siteName) {
        let browsePanel = new BrowsePanel();
        let newContentDialog = new NewContentDialog();
        let contentWizardPanel = new ContentWizardPanel();
        await this.typeNameInFilterPanel(siteName);
        await browsePanel.waitForContentDisplayed(siteName);
        await browsePanel.pause(300);
        await browsePanel.clickOnExpanderIcon(siteName);
        await browsePanel.clickCheckboxAndSelectRowByDisplayName('Templates');
        await browsePanel.clickOnNewButton();
        await newContentDialog.clickOnContentType(appConst.contentTypes.PAGE_TEMPLATE);
        await this.doSwitchToNewWizard();
        return await contentWizardPanel.waitForOpened();
    },

    //Clicks on Publish button on the toolbar then clicks on Publish button in the dialog
    async doPublish() {
        let browsePanel = new BrowsePanel();
        let contentPublishDialog = new ContentPublishDialog();
        await browsePanel.waitForPublishButtonVisible();
        await browsePanel.clickOnPublishButton();
        await contentPublishDialog.waitForDialogOpened();
        await contentPublishDialog.clickOnPublishNowButton();
        await contentPublishDialog.waitForDialogClosed();
        return await browsePanel.pause(1000);
    },
    async doPublishTree() {
        let browsePanel = new BrowsePanel();
        let contentPublishDialog = new ContentPublishDialog();
        await browsePanel.clickOnPublishTreeButton();
        await contentPublishDialog.waitForDialogOpened();
        await contentPublishDialog.clickOnPublishNowButton();
        return await contentPublishDialog.waitForDialogClosed();
    },
    //Parent content(work in progress) should be selected, clicks on 'Publish Tree menu item', then clicks on Mark as Ready menu item:
    async doMarkAsReadyAndPublishTree() {
        let browsePanel = new BrowsePanel();
        let contentPublishDialog = new ContentPublishDialog();
        await browsePanel.openPublishMenuSelectItem(appConst.PUBLISH_MENU.PUBLISH_TREE);
        await contentPublishDialog.waitForDialogOpened();
        await contentPublishDialog.clickOnMarkAsReadyMenuItem();
        await contentPublishDialog.clickOnPublishNowButton();
        return await contentPublishDialog.waitForDialogClosed();
    },
    async doPublishInWizard() {
        let contentPublishDialog = new ContentPublishDialog();
        let contentWizardPanel = new ContentWizardPanel();
        //1. Open Publish Content Dialog:
        await contentWizardPanel.clickOnPublishButton();
        await contentPublishDialog.waitForDialogOpened();
        //2. Click on Publish Now button:
        await contentPublishDialog.clickOnPublishNowButton();
        return await contentPublishDialog.waitForDialogClosed();
    },
    async doUnPublishInWizard() {
        let contentUnpublishDialog = new ContentUnpublishDialog();
        let contentWizardPanel = new ContentWizardPanel();
        //1. Click on Unpublish menu item:
        await contentWizardPanel.clickOnUnpublishMenuItem();
        await contentUnpublishDialog.waitForDialogOpened();
        //2. Click on Unpublish button:
        await contentUnpublishDialog.clickOnUnpublishButton();
        return await contentUnpublishDialog.waitForDialogClosed();
    },
    async findAndSelectItem(name) {
        let browsePanel = new BrowsePanel();
        await this.typeNameInFilterPanel(name);
        await browsePanel.waitForRowByNameVisible(name);
        await browsePanel.pause(300);
        await browsePanel.clickOnRowByName(name);
        return await browsePanel.pause(400);
    },
    async findAndSelectItemByDisplayName(displayName) {
        let browsePanel = new BrowsePanel();
        await this.typeNameInFilterPanel(displayName);
        await browsePanel.waitForContentByDisplayNameVisible(displayName);
        await browsePanel.pause(300);
        await browsePanel.clickOnRowByDisplayName(displayName);
        return await browsePanel.pause(400);
    },

    async findAndSelectContentByDisplayName(displayName) {
        let browsePanel = new BrowsePanel();
        await this.typeNameInFilterPanel(displayName);
        await browsePanel.waitForContentByDisplayNameVisible(displayName);
        return await browsePanel.clickOnRowByDisplayName(displayName);
    },

    async findContentAndClickCheckBox(displayName) {
        let browsePanel = new BrowsePanel();
        await this.typeNameInFilterPanel(displayName);
        await browsePanel.waitForContentByDisplayNameVisible(displayName);
        return await browsePanel.clickCheckboxAndSelectRowByDisplayName(displayName);
    },
    async selectSiteAndOpenNewWizard(siteName, contentType) {
        let browsePanel = new BrowsePanel();
        let newContentDialog = new NewContentDialog();
        let contentWizardPanel = new ContentWizardPanel();
        await this.findAndSelectItem(siteName);
        await browsePanel.waitForNewButtonEnabled();
        await browsePanel.clickOnNewButton();
        await newContentDialog.waitForOpened();
        await newContentDialog.typeSearchText(contentType);
        await newContentDialog.clickOnContentType(contentType);
        await this.doSwitchToNewWizard();
        await contentWizardPanel.waitForOpened();
        return await contentWizardPanel.waitForDisplayNameInputFocused();
    },
    async typeNameInFilterPanel(name) {
        try {
            let browsePanel = new BrowsePanel();
            let filterPanel = new FilterPanel();
            let result = await filterPanel.isPanelVisible();
            if (!result) {
                await browsePanel.clickOnSearchButton();
                await filterPanel.waitForOpened();
            }
            await filterPanel.typeSearchText(name);
            await browsePanel.waitForSpinnerNotVisible(appConst.TIMEOUT_5);
            return await browsePanel.pause(300);
        } catch (err) {
            this.saveScreenshot(appConst.generateRandomName('err_spinner'));
            throw new Error("Filter Panel-  error : " + err);
        }
    },

    async openFilterPanel() {
        try {
            let browsePanel = new BrowsePanel();
            let filterPanel = new FilterPanel();
            await browsePanel.clickOnSearchButton();
            return await filterPanel.waitForOpened();
        } catch (err) {
            throw new Error("Error when opening Filter Panel! " + err);
        }
    },
    async navigateToContentStudioApp(userName, password) {
        try {
            await this.clickOnContentStudioLink(userName, password);
            return await this.doSwitchToContentBrowsePanel();
        } catch (err) {
            console.log('tried to navigate to Content Studio app, but: ' + err);
            this.saveScreenshot(appConst.generateRandomName("err_navigate_to_studio"));
            throw new Error('error when navigate to Content Studio app ' + err);
        }
    },

    async clickOnContentStudioLink(userName, password) {
        let launcherPanel = new LauncherPanel();
        let result = await launcherPanel.waitForPanelDisplayed(2000);
        console.log("Launcher Panel is opened, click on the `Content Studio` link...");
        if (result) {
            await launcherPanel.clickOnContentStudioLink(userName, password);
        } else {
            console.log("Login Page is opened, type a password and name...");
            return await this.doLoginAndClickOnContentStudio(userName, password);
        }
    },
    //Clicks on Cancel button and switches to Default project
    async closeProjectSelectionDialog() {
        let projectSelectionDialog = new ProjectSelectionDialog();
        let isLoaded = await projectSelectionDialog.isDialogLoaded();
        if (isLoaded) {
            await projectSelectionDialog.clickOnCancelButtonTop();
            await projectSelectionDialog.waitForDialogClosed();
            return await webDriverHelper.browser.pause(200);
        }
    },
    async doLoginAndClickOnContentStudio(userName, password) {
        let loginPage = new LoginPage();
        await loginPage.doLogin(userName, password);
        let launcherPanel = new LauncherPanel();
        return await launcherPanel.clickOnContentStudioLink();

    },
    async doSwitchToContentBrowsePanel() {
        try {
            console.log('testUtils:switching to Content Browse panel...');
            let browsePanel = new BrowsePanel();
            await webDriverHelper.browser.switchWindow("Content Studio - Enonic XP Admin");
            console.log("switched to content browse panel...");
            await browsePanel.waitForGridLoaded(appConst.longTimeout);
            return browsePanel;
        } catch (err) {
            throw new Error("Error when switching to Content Studio App " + err);
        }
    },
    doSwitchToHome: function () {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.switchWindow("Enonic XP Home").then(() => {
            console.log("switched to Home...");
        }).then(() => {
            let homePage = new HomePage();
            return homePage.waitForLoaded(appConst.mediumTimeout);
        });
    },
    async doSwitchToPrevTab() {
        let tabs = await this.getBrowser().getWindowHandles();
        return await this.getBrowser().switchToWindow(tabs[tabs.length - 2]);
    },
    async doCloseWindowTabAndSwitchToBrowsePanel() {
        await webDriverHelper.browser.closeWindow();
        return await this.doSwitchToContentBrowsePanel();
    },

    async doPressBackspace() {
        await webDriverHelper.browser.keys('\uE003');
        return await webDriverHelper.browser.pause(200);
    },
    doPressTabKey() {
        return webDriverHelper.browser.keys('Tab');
    },
    doPressEnter() {
        return webDriverHelper.browser.keys('Enter');
    },

    doSwitchToNewWizard: function () {
        console.log('testUtils:switching to the new wizard tab...');
        let contentWizardPanel = new ContentWizardPanel();
        return webDriverHelper.browser.getWindowHandles().then(tabs => {
            return webDriverHelper.browser.switchToWindow(tabs[tabs.length - 1]);
        }).then(() => {
            return contentWizardPanel.waitForOpened();
        });
    },
    async doSwitchToNextTab() {
        let tabs = await webDriverHelper.browser.getWindowHandles();
        return await webDriverHelper.browser.switchToWindow(tabs[tabs.length - 1]);
    },
    doCloseAllWindowTabsAndSwitchToHome: function () {
        return webDriverHelper.browser.getWindowHandles().then(tabIds => {
            let result = Promise.resolve();
            tabIds.forEach(tabId => {
                result = result.then(() => {
                    return this.switchAndCheckTitle(tabId, "Enonic XP Home");
                }).then(result => {
                    if (!result) {
                        return webDriverHelper.browser.closeWindow().then(() => {
                            console.log(tabId + ' was closed');
                        }).catch(err => {
                            console.log(tabId + ' was not closed ' + err);
                        });
                    }
                });
            });
            return result;
        }).then(() => {
            return this.doSwitchToHome();
        });
    },
    switchAndCheckTitle: function (handle, reqTitle) {
        return webDriverHelper.browser.switchToWindow(handle).then(() => {
            return webDriverHelper.browser.getTitle().then(title => {
                return title.includes(reqTitle);
            }).catch(err => {
                console.log("Error when getting Title" + err);
                throw new Error("Error  " + err);
            })
        });
    },

    saveScreenshot: function (name, that) {
        let screenshotsDir = path.join(__dirname, '/../build/mochawesome-report/screenshots/');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, {recursive: true});
        }
        return webDriverHelper.browser.saveScreenshot(screenshotsDir + name + '.png').then(() => {
            if (that) {
                addContext(that, 'screenshots/' + name + '.png');
            }
            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    },
    async openLayersWidgetInBrowsePanel() {
        let browsePanel = new BrowsePanel();
        let browseDetailsPanel = new BrowseDetailsPanel();
        let browseLayersWidget = new BrowseLayersWidget();
        await browsePanel.openDetailsPanel();
        await browseDetailsPanel.openLayers();
        await browseLayersWidget.waitForWidgetLoaded();
        return browseLayersWidget;
    },
    async openVariantsWidget() {
        let browsePanel = new BrowsePanel();
        let browseDetailsPanel = new BrowseDetailsPanel();
        let browseVariantsWidget = new BrowseVariantsWidget();
        await browsePanel.openDetailsPanel();
        await browseDetailsPanel.openVariants();
        await browseVariantsWidget.waitForWidgetLoaded();
        return browseVariantsWidget;
    },
    async navigateToContentStudioWithProjects(userName, password) {
        try {
            await this.clickOnContentStudioLink(userName, password);
            console.log('testUtils:switching to Content Browse panel...');
            let browsePanel = new BrowsePanel();
            await this.getBrowser().switchWindow("Content Studio - Enonic XP Admin");
            return await browsePanel.pause(1500);
        } catch (err) {
            console.log('tried to navigate to Content Studio app, but: ' + err);
            this.saveScreenshot(appConst.generateRandomName("err_navigate_to_studio"));
            throw new Error('error when navigate to Content Studio app ' + err);
        }
    },
    isStringEmpty(str) {
        return (!str || 0 === str.length);
    },

    async openContentStudioMenu() {
        let result = await this.isContentStudioMenuOpened();
        if (!result) {
            await this.waitForElementDisplayed(lib.APP_MODE_SWITCHER_TOGGLER);
            await this.clickOnElement(lib.APP_MODE_SWITCHER_TOGGLER);
            return await webDriverHelper.browser.pause(200);
        }
    },
    async isContentStudioMenuOpened() {
        let element = await webDriverHelper.browser.$("//div[contains(@id,'AppWrapper')]");
        let atrValue = await element.getAttribute("class");
        return atrValue.includes("sidebar-expanded");
    },
    async openArchivePanel() {
        try {
            let archiveBrowsePanel = new ArchiveBrowsePanel();
            await this.openContentStudioMenu();
            await this.waitForElementDisplayed(lib.ARCHIVE_BUTTON, appConst.mediumTimeout);
            await this.clickOnElement(lib.ARCHIVE_BUTTON);
            await webDriverHelper.browser.pause(300);
            await archiveBrowsePanel.waitForGridLoaded(appConst.mediumTimeout);
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_open_settings"));
            throw new Error("Error Open Archive Panel: " + err);
        }
    },
    async switchToContentMode() {
        await this.clickOnElement(lib.MODE_CONTENT_BUTTON);
        await webDriverHelper.browser.pause(200);
        return new ContentBrowsePanel();
    },
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },

    async typeNameInUserFilterPanel(name) {
        let browsePanel = new UserBrowsePanel();
        let filterPanel = new PrincipalFilterPanel();
        await browsePanel.clickOnSearchButton();
        await filterPanel.waitForOpened();
        await filterPanel.typeSearchText(name);
        await browsePanel.pause(300);
        return await browsePanel.waitForSpinnerNotVisible();
    },
    async showLauncherPanel() {
        let launcherPanel = new LauncherPanel();
        let selector = "//button[contains(@class,'launcher-button') and child::span[contains(@class,'span-x')] ]";
        try {
            await this.waitUntilDisplayed(selector, 2000);
        } catch (err) {
            await webDriverHelper.browser.refresh();
            await webDriverHelper.browser.pause(2000);
            await this.closeProjectSelectionDialog();
            await this.waitUntilDisplayed(selector, 2000);
        }
        await webDriverHelper.browser.pause(100);
        let el = await this.getDisplayedElements(selector);
        await el[0].click();
        return await launcherPanel.waitForPanelDisplayed(1000);
    },
    async getDisplayedElements(selector) {
        let elements = await webDriverHelper.browser.$$(selector);
        let pr = elements.map(el => el.isDisplayed());
        return await Promise.all(pr).then(result => {
            return elements.filter((el, i) => result[i]);
        });
    },
    waitUntilDisplayed(selector, ms) {
        return webDriverHelper.browser.waitUntil(() => {
            return this.getDisplayedElements(selector).then(result => {
                return result.length > 0;
            })
        }, {timeout: ms, timeoutMsg: "Timeout exception. Element " + selector + " still not visible in: " + ms});
    },
    async navigateToContentStudioCloseProjectSelectionDialog(userName, password) {
        try {
            await this.clickOnContentStudioLink(userName, password);
            await this.getBrowser().switchWindow("Content Studio - Enonic XP Admin");
            await this.closeProjectSelectionDialog();
        } catch (err) {
            let screenshot = appConst.generateRandomName("err_navigate_to_studio")
            await this.saveScreenshot(screenshot);
            throw new Error('Error when navigate to Content Studio app. Screenshot: ' + screenshot + "  " + err);
        }
    },
    async openSettingsPanel() {
        try {
            let settingsBrowsePanel = new SettingsBrowsePanel();
            await this.openContentStudioMenu();
            await this.waitForElementDisplayed(lib.SETTINGS_BUTTON, appConst.mediumTimeout);
            await this.clickOnElement(lib.SETTINGS_BUTTON);
            await this.getBrowser().pause(300);
            await settingsBrowsePanel.waitForGridLoaded(appConst.mediumTimeout);
            return settingsBrowsePanel;
        } catch (err) {
            await this.saveScreenshot(appConst.generateRandomName("err_open_settings"));
            throw new Error("Settings Panel was not opened: " + err);
        }
    },
    async openLayersWidgetInBrowsePanel() {
        let browsePanel = new BrowsePanel();
        let browseDetailsPanel = new BrowseDetailsPanel();
        let browseLayersWidget = new BrowseLayersWidget();
        await browsePanel.openDetailsPanel();
        await browseDetailsPanel.openLayers();
        await browseLayersWidget.waitForWidgetLoaded();
        return browseLayersWidget;
    },
    async openProjectSelectionDialogAndSelectContext(context) {
        try {
            let browsePanel = new BrowsePanel();
            return await browsePanel.selectContext(context);
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_select_context');
            await this.saveScreenshot(screenshot);
            throw new Error('Error during selecting a context, screenshot: ' + screenshot + "  " + err);
        }
    },

    loadUrl(url) {
        return webDriverHelper.browser.url(url);
    },
};
