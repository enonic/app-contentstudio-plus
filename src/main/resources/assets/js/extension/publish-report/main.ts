import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {initConfig} from '@enonic/lib-contentstudio/v6/features/store/config.store';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {PublishReportExtension} from './PublishReportExtension';
import {resolveConfig} from '../../util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute, getOptionalAttribute} from '../../util/ModuleScriptHelper';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';
import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/features/store/activeProject.store';
import {initProjects} from '@enonic/lib-contentstudio/v6/features/store/projects.store';

void (() => {
    const currentScript = getModuleScript('publish-report');

    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const firstPublished = getOptionalAttribute(currentScript, 'data-publish-first');
    const isArchivedAttrValue = getOptionalAttribute(currentScript, 'data-archived');
    const isArchived = Boolean(isArchivedAttrValue == 'true');
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    CONFIG.setConfig(resolveConfig(configScriptId));
    initConfig(configScriptId);
    Messages.addMessages(JSON.parse(CONFIG.getString('phrasesAsJson')) as object);
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
