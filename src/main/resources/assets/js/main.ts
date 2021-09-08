// End of Polyfills
import {i18nInit} from 'lib-admin-ui/util/MessagesInitializer';
import {Body} from 'lib-admin-ui/dom/Body';
import {ArchiveApp} from './ArchiveApp';
import {AppWrapper} from 'lib-contentstudio/app/AppWrapper';
import {Messages} from 'lib-admin-ui/util/Messages';

declare const CONFIG;


const body = Body.get();

function injectApp() {
    const appWrapper: AppWrapper = <AppWrapper>body.findChildById('AppWrapper');
    appWrapper.addApp(new ArchiveApp());
}

(async () => {
    Messages.setMessages({});
    const i18nUrl: string = CONFIG.services.i18nUrl.replace(new RegExp('contentstudio', 'g'), 'contentstudio.plus');
    await i18nInit(i18nUrl);

    const renderListener = () => {
        injectApp();
        body.unRendered(renderListener);
    };
    if (body.isRendered()) {
        renderListener();
    } else {
        body.onRendered(renderListener);
    }
})();
