import {i18nAdd} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ArchiveAppContainer} from './ArchiveAppContainer';
import {resolveConfig} from './util/WidgetConfigResolver';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';

const injectApp = (widgetElem: Element): void => {
    const archiveAppContainer: ArchiveAppContainer = new ArchiveAppContainer();
    widgetElem.appendChild(archiveAppContainer);
};

const init = async (configScriptId: string, i18nServiceUrl: string): Promise<void> => {
    // await i18nAdd(i18nServiceUrl);
    CONFIG.setConfig(resolveConfig(configScriptId));

    // await i18nInit(CONFIG.getString('services.i18nUrlStudio'));
    // await i18nAdd(CONFIG.getString('services.i18nUrl'));

    try {
        const phrases: object = JSON.parse(CONFIG.getString('phrases')) as object;
        Messages.addMessages(phrases);
    } catch (e) {
        console.error('Failed to parse phrases', e);
    }
};

void (async (currentScript: HTMLOrSVGScriptElement) => {
    if (!currentScript) {
        throw Error('Legacy browsers are not supported');
    }

    const configScriptId = currentScript.getAttribute('data-config-script-id');
    const i18nServiceUrl = currentScript.getAttribute('data-i18n-service-url');
    const elemId: string = currentScript.getAttribute('data-widget-id');

    if (!configScriptId || !i18nServiceUrl || !elemId) {
        throw Error('Missing attributes on inject script');
    }

    await init(configScriptId, i18nServiceUrl);

    const body: Body = Body.get();
    const widgetEl: Element = body.findChildById(elemId, true);

    const renderListener = (): void => {
        injectApp(widgetEl);
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})(document.currentScript);
