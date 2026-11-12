import {initConfig} from '../../shared/config';
import {setPhrases} from '../../shared/i18n';
import {setActiveProject} from '../../shared/project';
import {AppHelper} from '../../util/AppHelper';
import {getModuleScript, getOptionalAttribute, getRequiredAttribute} from '../../util/ModuleScriptHelper';
import {LayersWidget} from '../../v6/features/views/context/widget/layers/LayersWidget';
import {mountExtension} from '../mountExtension';
import {mountNotifications} from '../mountNotifications';

void (() => {
    const currentScript = getModuleScript('layers');

    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    setPhrases(initConfig(configScriptId).phrases);
    mountNotifications();
    setActiveProject(projectName);

    mountExtension({
        className: AppHelper.getLayersExtensionClass(),
        idPrefix: 'LayersWidget',
        contentId,
        children: <LayersWidget contentId={contentId} />,
    });
})();
