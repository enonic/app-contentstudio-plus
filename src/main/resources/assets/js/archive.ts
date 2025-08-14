import {Body} from '@enonic/lib-admin-ui/dom/Body';
import type {Element} from '@enonic/lib-admin-ui/dom/Element';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {ArchiveAppContainer} from './ArchiveAppContainer';
import {resolveConfig} from './util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute} from './util/ModuleScriptHelper';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';
import {AuthContext} from '@enonic/lib-admin-ui/auth/AuthContext';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';

const injectApp = (widgetElem: Element): void => {
    const archiveAppContainer = new ArchiveAppContainer();
    widgetElem.appendChild(archiveAppContainer);
};

const init = (configScriptId: string): void => {
    CONFIG.setConfig(resolveConfig(configScriptId));
    Messages.addMessages(JSON.parse(CONFIG.getString('phrasesAsJson')) as object);
    AuthContext.init(Principal.fromJson(CONFIG.get('user') as PrincipalJson),
        (CONFIG.get('principals') as PrincipalJson[]).map(Principal.fromJson));
};

void (() => {
    const currentScript = getModuleScript('archive');

    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const elemId = getRequiredAttribute(currentScript, 'data-widget-id');

    init(configScriptId);

    const body: Body = Body.get();
    const widgetEl: Element = body.findChildById(elemId, true);

    const renderListener = (): void => {
        injectApp(widgetEl);
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})();
