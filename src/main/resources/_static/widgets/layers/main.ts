import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {LayersWidget} from '../layers/LayersWidget';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18nInit, i18nAdd} from '@enonic/lib-admin-ui/util/MessagesInitializer';

void (async () => {
    const contentId = document.currentScript.getAttribute('data-content-id');
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Missing \'data-config-service-url\' attribute';
    }

    await CONFIG.init(configServiceUrl);
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
