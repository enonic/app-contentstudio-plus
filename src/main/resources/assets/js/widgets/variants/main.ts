import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {VariantsWidget} from './VariantsWidget';
import {resolveConfig} from '../../util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute, getOptionalAttribute} from '../../util/ModuleScriptHelper';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';

void (() => {
    const currentScript = getModuleScript('variants');

    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');

    CONFIG.setConfig(resolveConfig(configScriptId));
    Messages.addMessages(JSON.parse(CONFIG.getString('phrasesAsJson')) as object);

    const widgetContainer = Element.fromHtmlElement(
        document.querySelector(`.${AppHelper.getCommonWidgetContainerClass()}`),
        true
    );

    widgetContainer
        .render()
        .then(() => {
            const widget = new VariantsWidget(contentId);
            widgetContainer.appendChild(widget);
        });
})();
