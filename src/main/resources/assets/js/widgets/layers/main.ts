import {Element} from 'lib-admin-ui/dom/Element';
import {WidgetConfig} from '../Widget';
import {LayersWidget} from '../layers/LayersWidget';
import {AppHelper} from '../../util/AppHelper';

declare const CS_PLUS_LAYERS_CONFIG: WidgetConfig;

(() => {
    const widgetContainer = document.getElementById(AppHelper.getLayersWidgetClass());

    if (widgetContainer) {
        const existingWidget = widgetContainer.getElementsByClassName(AppHelper.getLayersWidgetClass()).item(0);
        if (existingWidget) {
            existingWidget.remove();
        }

        const widgetContainerEl = Element.fromHtmlElement((widgetContainer as HTMLElement), true);

        const widget = new LayersWidget(CS_PLUS_LAYERS_CONFIG);
        widgetContainerEl.appendChild(widget);

        widget.render();
    }
})();
