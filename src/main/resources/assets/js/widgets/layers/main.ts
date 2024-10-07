import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {LayersWidget} from '../layers/LayersWidget';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18nAdd, i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {resolveConfig} from '../../util/WidgetConfigResolver';

void (async () => {
    const contentId = document.currentScript.getAttribute('data-content-id');
    const configScriptId = document.currentScript.getAttribute('data-config-script-id');
    if (!configScriptId) {
        throw Error('Missing \'data-config-script-id\' attribute');
    }

    CONFIG.setConfig(resolveConfig(configScriptId));

    await i18nInit(CONFIG.getString('services.i18nUrlStudio'));
    await i18nAdd(CONFIG.getString('services.i18nUrl'));

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
