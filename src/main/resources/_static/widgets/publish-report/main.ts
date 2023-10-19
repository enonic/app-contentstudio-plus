import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {i18nAdd, i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {PublishReportWidget} from './PublishReportWidget';

void (async () => {
    const contentId = document.currentScript.getAttribute('data-content-id');
    const publishFirstAsString = document.currentScript.getAttribute('data-publish-first');
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Missing \'data-config-service-url\' attribute';
    }

    await CONFIG.init(configServiceUrl);
    await i18nInit(CONFIG.getString('services.i18nUrlStudio'));
    await i18nAdd(CONFIG.getString('services.i18nUrl'));

    const widgetContainer = document.getElementById(AppHelper.getPublishReportWidgetClass());

    if (widgetContainer) {
        const widgetContainerEl = Element.fromHtmlElement((widgetContainer), true);
        widgetContainerEl.removeChildren(); // removing non needed script and link nodes

        const widget: PublishReportWidget = PublishReportWidget.get();
        widget.setContentId(contentId);
        widget.setPublishFirstDateString(publishFirstAsString);
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
