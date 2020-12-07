import {Element} from 'lib-admin-ui/dom/Element';
import {WidgetConfig} from '../Widget';
import {LayersWidget} from '../layers/LayersWidget';
import {AppHelper} from '../../util/AppHelper';
import {i18nAdd} from 'lib-admin-ui/util/MessagesInitializer';

declare const CS_PLUS_LAYERS_CONFIG: WidgetConfig;

(async () => {
    await i18nAdd(CS_PLUS_LAYERS_CONFIG.i18nUrl);

    const widgetContainer = document.getElementById(AppHelper.getLayersWidgetClass());

    if (widgetContainer) {
        const existingWidget = widgetContainer.getElementsByClassName(AppHelper.getLayersWidgetClass()).item(0);
        if (existingWidget) {
            existingWidget.remove();
        }
        //const containerEl = Element.fromHtmlElement((container as HTMLElement), true);

        const widgetContainerEl = Element.fromHtmlElement((widgetContainer as HTMLElement), true);

        const widget = new LayersWidget(CS_PLUS_LAYERS_CONFIG);
        widgetContainerEl.appendChild(widget);

        widget.render();
    }
})();
