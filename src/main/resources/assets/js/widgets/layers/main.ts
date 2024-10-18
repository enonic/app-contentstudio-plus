import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {LayersWidget} from '../layers/LayersWidget';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {resolveConfig} from '../../util/WidgetConfigResolver';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';

void (() => {
    const contentId = document.currentScript.getAttribute('data-content-id');
    const configScriptId = document.currentScript.getAttribute('data-config-script-id');
    if (!configScriptId) {
        throw Error('Missing \'data-config-script-id\' attribute');
    }

    CONFIG.setConfig(resolveConfig(configScriptId));
    const phrases: object = JSON.parse(CONFIG.getString('phrases')) as object;
    Messages.addMessages(phrases);

    const widgetContainer = document.getElementById(AppHelper.getLayersWidgetClass());

    if (widgetContainer) {
        const existingWidget = widgetContainer.getElementsByClassName(AppHelper.getLayersWidgetClass()).item(0);
        if (existingWidget) {
            existingWidget.remove();
        }

        const widgetContainerEl = Element.fromHtmlElement((widgetContainer), true);

        const widget = new LayersWidget(contentId);
        widgetContainerEl.appendChild(widget);

        void widget.render();
    }
})();
