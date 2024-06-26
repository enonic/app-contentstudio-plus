import {Flag} from 'lib-contentstudio/app/locale/Flag';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';
import {ProjectIconUrlResolver} from 'lib-contentstudio/app/project/ProjectIconUrlResolver';
import * as Q from 'q';

export class LangBasedContentSummaryViewer extends ContentSummaryAndCompareStatusViewer {

    protected readonly project: Project;

    constructor(project: Project) {
        super();

        this.project = project;
    }

    resolveIconUrl(): string {
        return this.project.getIcon() ? new ProjectIconUrlResolver()
            .setProjectName(this.project.getName())
            .setTimestamp(new Date().getTime())
            .resolve() : null;
    }

    resolveIconClass(): string {
        return ProjectIconUrlResolver.getDefaultIcon(this.project);
    }

    resolveIconEl(): Flag {
        if (this.project.getIcon()) {
            return null;
        }

        const language: string = this.project.getLanguage();
        return language ? new Flag(language) : null;
    }


    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('lang-based-content-summary-viewer');

            return rendered;
        });
    }

}
