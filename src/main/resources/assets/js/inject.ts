import {i18nAdd} from 'lib-admin-ui/util/MessagesInitializer';
import {Body} from 'lib-admin-ui/dom/Body';
import {ArchiveApp} from './ArchiveApp';
import {AppWrapper} from 'lib-contentstudio/app/AppWrapper';
import {CONFIG} from 'lib-admin-ui/util/Config';

const injectApp = (body: Body): void => {
    const appWrapper: AppWrapper = <AppWrapper>body.findChildById('AppWrapper');
    appWrapper.addApp(new ArchiveApp(), 1);
};

const init = async (uri: string, id: string): Promise<void> => {
    const serviceUri = `${uri}/_/service/${id}/`;
    const i18nServiceUrl = `${serviceUri}i18n`;
    const configServiceUrl = `${serviceUri}config`;
    const body = Body.get();

    await i18nAdd(i18nServiceUrl);
    await CONFIG.init(configServiceUrl);

    const renderListener = (): void => {
        injectApp(body);
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
};

void (async (currentScript: HTMLOrSVGScriptElement) => {
    if (!currentScript) {
        throw 'Legacy browsers are not supported';
    }

    const adminToolUri = currentScript.getAttribute('data-tool-uri');
    const adminToolId = currentScript.getAttribute('data-tool-id');
    if (!adminToolUri || !adminToolId) {
        throw 'Missing attributes on inject script';
    }

    await init(adminToolUri, adminToolId);
})(document.currentScript);
