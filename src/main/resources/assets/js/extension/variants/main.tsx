import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$projects, initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {setActiveProjectResolver} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';
import {initConfig} from '../../shared/config';
import {setPhrases} from '../../shared/i18n';
import {AppHelper} from '../../util/AppHelper';
import {getModuleScript, getOptionalAttribute, getRequiredAttribute} from '../../util/ModuleScriptHelper';
import {VariantsWidget} from '../../v6/features/views/context/widget/variants/VariantsWidget';
import {mountExtension} from '../mountExtension';

void (() => {
    const currentScript = getModuleScript('variants');

    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    setPhrases(initConfig(configScriptId).phrases);
    setActiveProjectResolver(() => $projects.get().activeProjectId);
    initProjects(projectName);

    whenProjectInitialized(() => mountExtension({
        className: AppHelper.getVariantsExtensionClass(),
        idPrefix: 'VariantsWidget',
        contentId,
        children: <VariantsWidget contentId={contentId} />,
    }));
})();
