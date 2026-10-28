import {Body} from '@enonic/lib-admin-ui/dom/Body';
import type {Element} from '@enonic/lib-admin-ui/dom/Element';
import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$projects, initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {setActiveProjectResolver} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';
import {initConfig} from './shared/config';
import {setPhrases} from './shared/i18n';
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
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    setPhrases(initConfig(configScriptId).phrases);
    setActiveProjectResolver(() => $projects.get().activeProjectId);
    initProjects();

    const renderListener = (): void => {
        whenProjectInitialized(() => {
            void injectApp(widgetEl);
        });
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})();
