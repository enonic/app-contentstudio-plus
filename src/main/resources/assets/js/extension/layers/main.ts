import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {initConfig} from '@enonic/lib-contentstudio/v6/shared/config/config.store';
import {AppHelper} from '../../util/AppHelper';
import {LayersExtension} from './LayersExtension';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import type {Phrases} from '@enonic/ui-utils';
import {resolveConfig} from '../../util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute, getOptionalAttribute} from '../../util/ModuleScriptHelper';
import {setPhrases} from '../../shared/i18n';
import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$projects, initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {setActiveProjectResolver} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';

void (() => {
    const currentScript = getModuleScript('layers');

    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    CONFIG.setConfig(resolveConfig(configScriptId));
    initConfig(configScriptId);
    setPhrases(JSON.parse(CONFIG.getString('phrasesAsJson')) as Phrases);
    setActiveProjectResolver(() => $projects.get().activeProjectId);
    initProjects(projectName);

    const extensionContainer = Element.fromHtmlElement(
        document.querySelector(`.${AppHelper.getCommonExtensionContainerClass()}`),
        true
    );

    extensionContainer
        .render()
        .then(() => whenProjectInitialized(() => {
            extensionContainer.appendChild(new LayersExtension(contentId));
        }));

})();
