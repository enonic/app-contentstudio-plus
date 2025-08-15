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

    const widgetContainer = document.getElementById(AppHelper.getVariantsWidgetClass());

    if (widgetContainer) {
        const widgetContainerEl = Element.fromHtmlElement((widgetContainer), true);
        widgetContainerEl.removeChildren(); // removing non needed script and link nodes

        const widget: VariantsWidget = VariantsWidget.get();
        widget.setContentId(contentId);
        widgetContainerEl.appendChild(widget);

        void widget.render();

        widget.whenRendered(() => {
            const checkPresentInDomInterval = setInterval(() => {
                if (!widget.getHTMLElement().isConnected) {
                    clearInterval(checkPresentInDomInterval);
                    widget.cleanUp();
                }
            }, 1000);
        });
    }
})();
