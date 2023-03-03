/**
 * Created on 08.12.2021
 */
const Page = require('../page');
const appConst = require('../../libs/app_const');

const xpath = {
    container: `//div[contains(@id,'ArchiveBrowsePanel')]//div[contains(@id,'WidgetView')]//div[contains(@id,'PropertiesWidgetItemView')]`,
    languageProperty: "//dd[contains(.,'Language')]/following-sibling::dt[1]",
    ownerProperty: "//dd[contains(.,'Owner')]/following-sibling::dt[1]",
    typeProperty: "//dd[contains(.,'Type')]/following-sibling::dt[1]",
    applicationProperty: "//dd[contains(.,'Application')]/following-sibling::dt[1]",
    firstPublishedProperty: "//dd[contains(.,'First Published')]/following-sibling::dt[1]",
    archivedProperty: "//dd[contains(.,'Archived')]/following-sibling::dt[1]",
};

class ArchivedContentPropertiesWidget extends Page {

    get languageProperty() {
        return xpath.container + xpath.languageProperty;
    }

    get ownerProperty() {
        return xpath.container + xpath.ownerProperty;
    }

    get typeProperty() {
        return xpath.container + xpath.typeProperty;
    }

    get applicationProperty() {
        return xpath.container + xpath.applicationProperty;
    }

    get firstPublishedProperty() {
        return xpath.container + xpath.firstPublishedProperty;
    }

    get archivedProperty() {
        return xpath.container + xpath.archivedProperty;
    }

    async waitForLanguageVisible() {
        try {
            await this.waitForElementDisplayed(this.languageProperty, appConst.shortTimeout);
        } catch (err) {
            //Workaround for the issue with empty details panel in Wizard
            await this.refresh();
            await this.pause(2000);
            await this.waitForElementDisplayed(this.languageProperty, appConst.shortTimeout);
        }
    }

    waitForLanguageNotVisible() {
        return this.waitForElementNotDisplayed(this.languageProperty, appConst.shortTimeout).catch(err => {
            throw new Error("Language should not be present in the properties widget! " + err);
        });
    }

    waitForOwnerNotVisible() {
        return this.waitForElementNotDisplayed(this.ownerProperty, appConst.shortTimeout).catch(err => {
            throw new Error("Owner should not be present in the properties widget! " + err);
        });
    }

    async getLanguage() {
        await this.waitForLanguageVisible();
        return await this.getText(this.languageProperty);
    }

    async getFirstPublished() {
        await this.waitForElementDisplayed(this.firstPublishedProperty, appConst.shortTimeout);
        return await this.getText(this.firstPublishedProperty);
    }

    async getOwner() {
        try {
            await this.waitForElementDisplayed(this.ownerProperty, appConst.shortTimeout);
            return await this.getText(this.ownerProperty);
        } catch (err) {
            //Workaround for the issue with empty details panel in Wizard
            await this.refresh();
            await this.pause(2000);
            await this.waitForElementDisplayed(this.ownerProperty, appConst.shortTimeout);
        }
    }

    async getType() {
        try {
            await this.waitForElementDisplayed(this.typeProperty, appConst.shortTimeout);
            return await this.getText(this.typeProperty);
        } catch (err) {
            //Workaround for the issue with empty details panel in Wizard
            await this.refresh();
            await this.pause(2000);
            await this.waitForElementDisplayed(this.typeProperty, appConst.shortTimeout);
        }
    }

    async getApplication() {
        try {
            await this.waitForElementDisplayed(this.applicationProperty, appConst.shortTimeout);
            return await this.getText(this.applicationProperty);
        } catch (err) {
            //Workaround for the issue with empty details panel in Wizard
            await this.refresh();
            await this.pause(2000);
            await this.waitForElementDisplayed(this.applicationProperty, appConst.shortTimeout);
        }
    }
}

module.exports = ArchivedContentPropertiesWidget;
