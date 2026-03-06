import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {PublishReportExtension} from './PublishReportExtension';
import {resolveConfig} from '../../util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute, getOptionalAttribute} from '../../util/ModuleScriptHelper';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';

void (() => {
    const currentScript = getModuleScript('publish-report');

    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const firstPublished = getOptionalAttribute(currentScript, 'data-publish-first');
    const isArchivedAttrValue = getOptionalAttribute(currentScript, 'data-archived');
    const isArchived = Boolean(isArchivedAttrValue == 'true');

    CONFIG.setConfig(resolveConfig(configScriptId));
    Messages.addMessages(JSON.parse(CONFIG.getString('phrasesAsJson')) as object);

    const extensionContainer = Element.fromHtmlElement(
        document.querySelector(`.${AppHelper.getCommonExtensionContainerClass()}`),
        true
    );

    extensionContainer
        .render()
        .then(() => extensionContainer.appendChild(new PublishReportExtension(contentId, firstPublished, isArchived)));
})();
