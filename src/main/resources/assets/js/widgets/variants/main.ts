import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18nAdd, i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {VariantsWidget} from './VariantsWidget';

void (async () => {
    const contentId = document.currentScript.getAttribute('data-content-id');
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Missing \'data-config-service-url\' attribute';
    }

    await CONFIG.init(configServiceUrl);
    await i18nInit(CONFIG.getString('services.i18nUrlStudio'));
    await i18nAdd(CONFIG.getString('services.i18nUrl'));

    const widgetContainer = document.getElementById(AppHelper.getVariantsWidgetClass());

    if (widgetContainer) {
        const widgetContainerEl = Element.fromHtmlElement((widgetContainer), true);

        const widget: VariantsWidget = VariantsWidget.get();
        widget.setContentId(contentId);
        widgetContainerEl.appendChild(widget);

        void widget.render();
    }
})();
