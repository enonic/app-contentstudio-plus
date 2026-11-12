import {initConfig} from '../../shared/config';
import {setPhrases} from '../../shared/i18n';
import {setActiveProject} from '../../shared/project';
import {AppHelper} from '../../util/AppHelper';
import {getModuleScript, getOptionalAttribute, getRequiredAttribute} from '../../util/ModuleScriptHelper';
import {VariantsWidget} from '../../v6/features/views/context/widget/variants/VariantsWidget';
import {mountExtension} from '../mountExtension';
import {mountNotifications} from '../mountNotifications';

void (() => {
    const currentScript = getModuleScript('variants');

    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    setPhrases(initConfig(configScriptId).phrases);
    mountNotifications();
    setActiveProject(projectName);

    mountExtension({
        className: AppHelper.getVariantsExtensionClass(),
        idPrefix: 'VariantsWidget',
        contentId,
        children: <VariantsWidget contentId={contentId} />,
    });
})();
