import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {getActiveProjectName, onActiveProjectChanged, whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$projects, initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {setPhrases as setStudioPhrases} from '@enonic/lib-contentstudio/v6/shared/i18n';
import {setActiveProjectResolver} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';
import {mountNotifications} from './extension/mountNotifications';
import {initConfig} from './shared/config';
import {initLegacyConfig} from './shared/config/legacy';
import {setPhrases} from './shared/i18n';
import {setActiveProject} from './shared/project';
import {getModuleScript, getRequiredAttribute} from './util/ModuleScriptHelper';

// ! Import the app container lazily so v6 config is initialized (initConfig below)
// ! before modules such as liveViewWidgets.store run their import-time widget fetch.
// ! A static import evaluates that fetch against an empty extensionApiUrl, leaving
// ! the preview widget selector empty. Mirrors app-contentstudio main.ts.
const injectApp = async (host: HTMLElement): Promise<void> => {
    const {ArchiveAppContainer} = await import('./ArchiveAppContainer');
    const widgetEl = Element.fromHtmlElement(host);
    await widgetEl.render();
    widgetEl.appendChild(new ArchiveAppContainer());
};

void (() => {
    const currentScript = getModuleScript('/archive.js');
    const elemId = getRequiredAttribute(currentScript, 'data-widget-id');

    const body: Body = Body.get();
    const host = document.getElementById(elemId);
    if (!host) {
        throw Error(`Could not find the widget element: ${elemId}`);
    }
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const {phrases} = initConfig(configScriptId);
    setPhrases(phrases);
    initLegacyConfig(configScriptId);
    setStudioPhrases(phrases);
    mountNotifications();
    setActiveProjectResolver(() => $projects.get().activeProjectId);
    initProjects();

    const renderListener = (): void => {
        whenProjectInitialized(() => {
            setActiveProject(getActiveProjectName());
            onActiveProjectChanged(() => setActiveProject(getActiveProjectName()));
            void injectApp(host);
        });
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})();
