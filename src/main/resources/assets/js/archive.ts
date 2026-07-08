import {Body} from '@enonic/lib-admin-ui/dom/Body';
import type {Element} from '@enonic/lib-admin-ui/dom/Element';
import {initConfig} from '@enonic/lib-contentstudio/v6/shared/config/config.store';
import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {getModuleScript, getRequiredAttribute} from './util/ModuleScriptHelper';

// ! Import the app container lazily so v6 config is initialized (initConfig below)
// ! before modules such as liveViewWidgets.store run their import-time widget fetch.
// ! A static import evaluates that fetch against an empty extensionApiUrl, leaving
// ! the preview widget selector empty. Mirrors app-contentstudio main.ts.
const injectApp = async (widgetElem: Element): Promise<void> => {
    const {ArchiveAppContainer} = await import('./ArchiveAppContainer');
    const archiveAppContainer = new ArchiveAppContainer();
    widgetElem.appendChild(archiveAppContainer);
};

void (() => {
    const currentScript = getModuleScript('/archive.js');
    const elemId = getRequiredAttribute(currentScript, 'data-widget-id');

    const body: Body = Body.get();
    const widgetEl: Element = body.findChildById(elemId, true);
    initConfig(getRequiredAttribute(currentScript, 'data-config-script-id'));
    initProjects();

    const renderListener = (): void => {
        whenProjectInitialized(() => {
            void injectApp(widgetEl);
        });
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})();
