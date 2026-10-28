import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {PublishReportExtension} from './PublishReportExtension';
import {initConfig} from '../../shared/config';
import {getModuleScript, getRequiredAttribute, getOptionalAttribute} from '../../util/ModuleScriptHelper';
import {setPhrases} from '../../shared/i18n';
import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$projects, initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {setActiveProjectResolver} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';

void (() => {
    const currentScript = getModuleScript('publish-report');

    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const firstPublished = getOptionalAttribute(currentScript, 'data-publish-first');
    const isArchivedAttrValue = getOptionalAttribute(currentScript, 'data-archived');
    const isArchived = Boolean(isArchivedAttrValue == 'true');
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    setPhrases(initConfig(configScriptId).phrases);
    setActiveProjectResolver(() => $projects.get().activeProjectId);
    initProjects(projectName);

    const extensionContainer = Element.fromHtmlElement(
        document.querySelector(`.${AppHelper.getCommonExtensionContainerClass()}`),
        true
    );

    extensionContainer
        .render()
        .then(() => whenProjectInitialized(() => {
            extensionContainer.appendChild(new PublishReportExtension(contentId, firstPublished, isArchived));
        }));
})();
