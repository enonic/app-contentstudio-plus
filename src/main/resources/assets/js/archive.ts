import {Body} from '@enonic/lib-admin-ui/dom/Body';
import type {Element} from '@enonic/lib-admin-ui/dom/Element';
import {initConfig} from '@enonic/lib-contentstudio/v6/shared/config/config.store';
import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {ArchiveAppContainer} from './ArchiveAppContainer';
import {getModuleScript, getRequiredAttribute} from './util/ModuleScriptHelper';

const injectApp = (widgetElem: Element): void => {
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
            injectApp(widgetEl);
        });
        body.unRendered(renderListener);
    };
    body.whenRendered(renderListener);
})();
