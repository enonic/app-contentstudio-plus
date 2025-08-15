import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {AppHelper} from '../../util/AppHelper';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {PublishReportWidget} from './PublishReportWidget';
import {resolveConfig} from '../../util/WidgetConfigResolver';
import {getModuleScript, getRequiredAttribute, getOptionalAttribute} from '../../util/ModuleScriptHelper';
import {Messages} from '@enonic/lib-admin-ui/util/Messages';

void (() => {
    const currentScript = getModuleScript('publish-report');
    
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const publishFirstAsString = getOptionalAttribute(currentScript, 'data-publish-first');
    const isArchivedAttrValue = getOptionalAttribute(currentScript, 'data-archived');
    const isArchived = Boolean(isArchivedAttrValue == 'true');

    CONFIG.setConfig(resolveConfig(configScriptId));
    Messages.addMessages(JSON.parse(CONFIG.getString('phrasesAsJson')) as object);

    const containerId = AppHelper.getPublishReportWidgetClass() + (isArchived ? '-archived' : '');
    const widgetContainer = document.getElementById(containerId);

    if (widgetContainer) {
        const widgetContainerEl = Element.fromHtmlElement((widgetContainer), true);
        widgetContainerEl.removeChildren(); // removing non needed script and link nodes

        const widget: PublishReportWidget =
            PublishReportWidget.get()
            .setPublishFirstDateString(publishFirstAsString)
            .setIsContentArchived(isArchived);

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
