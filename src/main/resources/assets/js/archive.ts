import {i18nAdd} from 'lib-admin-ui/util/MessagesInitializer';
import {Body} from 'lib-admin-ui/dom/Body';
import {Element} from 'lib-admin-ui/dom/Element';
import {CONFIG} from 'lib-admin-ui/util/Config';
import {ArchiveAppContainer} from './ArchiveAppContainer';

const injectApp = (widgetElem: Element): void => {
    const archiveAppContainer: ArchiveAppContainer = new ArchiveAppContainer();
    widgetElem.appendChild(archiveAppContainer);
};

const init = async (configServiceUrl: string, i18nServiceUrl: string): Promise<void> => {
    await i18nAdd(i18nServiceUrl);
    await CONFIG.init(configServiceUrl);
};

void (async (currentScript: HTMLOrSVGScriptElement) => {
    if (!currentScript) {
        throw 'Legacy browsers are not supported';
    }

    const configServiceUrl = currentScript.getAttribute('configServiceUrl');
    const i18nServiceUrl = currentScript.getAttribute('i18nServiceUrl');
    const elemId: string = currentScript.getAttribute('elemId');

    if (!configServiceUrl || !i18nServiceUrl || !elemId) {
        throw 'Missing attributes on inject script';
    }

    await init(configServiceUrl, i18nServiceUrl);

    const body: Body = Body.get();
    const widgetEl: Element = body.findChildById(elemId, true);

    const renderListener = (): void => {
        injectApp(widgetEl);
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})(document.currentScript);
