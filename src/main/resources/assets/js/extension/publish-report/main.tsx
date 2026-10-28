import {whenProjectInitialized} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {$projects, initProjects} from '@enonic/lib-contentstudio/v6/entities/project/projects.store';
import {setActiveProjectResolver} from '@enonic/lib-contentstudio/v6/shared/lib/url/cms';
import {initConfig} from '../../shared/config';
import {setPhrases} from '../../shared/i18n';
import {AppHelper} from '../../util/AppHelper';
import {getModuleScript, getOptionalAttribute, getRequiredAttribute} from '../../util/ModuleScriptHelper';
import {PublishReportWidget} from '../../v6/features/views/context/widget/publish-report/PublishReportWidget';
import {mountExtension} from '../mountExtension';

const parseDate = (value: string | null): Date | null => {
    const date = value ? new Date(value) : null;
    return date && !isNaN(date.getTime()) ? date : null;
};

void (() => {
    const currentScript = getModuleScript('publish-report');

    const configScriptId = getRequiredAttribute(currentScript, 'data-config-script-id');
    const contentId = getOptionalAttribute(currentScript, 'data-content-id');
    const firstPublished = parseDate(getOptionalAttribute(currentScript, 'data-publish-first'));
    const isArchived = getOptionalAttribute(currentScript, 'data-archived') === 'true';
    const projectName = getOptionalAttribute(currentScript, 'data-project');

    setPhrases(initConfig(configScriptId).phrases);
    setActiveProjectResolver(() => $projects.get().activeProjectId);
    initProjects(projectName);

    whenProjectInitialized(() => mountExtension({
        className: AppHelper.getPublishReportExtensionClass(),
        idPrefix: 'PublishReportWidget',
        contentId,
        children: (
            <PublishReportWidget
                contentId={contentId}
                firstPublished={firstPublished}
                isArchived={isArchived}
                injected
            />
        ),
    }));
})();
