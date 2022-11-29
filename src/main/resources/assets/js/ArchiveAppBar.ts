import {AppBar} from '@enonic/lib-admin-ui/app/bar/AppBar';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ProjectViewer} from 'lib-contentstudio/app/settings/wizard/viewer/ProjectViewer';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ProjectSelectionDialog} from 'lib-contentstudio/app/dialog/ProjectSelectionDialog';
import {ProjectUpdatedEvent} from 'lib-contentstudio/app/settings/event/ProjectUpdatedEvent';
import {ProjectListWithMissingRequest} from 'lib-contentstudio/app/settings/resource/ProjectListWithMissingRequest';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';

export class ArchiveAppBar extends AppBar {

    private selectedProjectViewer: ProjectViewer;

    constructor(application: Application) {
        super(application);

        this.initElements();
        this.initListeners();
        this.handleProjectUpdate();
    }

    disable(): void {
        this.selectedProjectViewer.setObject(Project.create().setDisplayName(`<${i18n('settings.projects.notfound')}>`).build());
        this.selectedProjectViewer.addClass('no-project');
    }

    enable(): void {
        this.selectedProjectViewer.removeClass('no-project');
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-appbar');
            const iconEl: DivEl = new DivEl('project-selection-icon icon-compare');

            this.selectedProjectViewer.setTitle(i18n('text.selectContext'));
            this.selectedProjectViewer.appendChild(iconEl);

            this.appendChild(this.selectedProjectViewer);
            this.appendChild(new DivEl('separator').setHtml('/'));
            this.addClass('appbar-content');

            this.getAppIcon().setAppName(i18n('app.archive'));

            return rendered;
        });
    }

    private initElements(): void {
        this.selectedProjectViewer = new ProjectViewer();
    }

    private initListeners(): void {
        this.selectedProjectViewer.onClicked(() => {
            ProjectSelectionDialog.get().open();
        });

        const handler: () => void = this.handleProjectUpdate.bind(this);

        ProjectContext.get().onProjectChanged(handler);
        ProjectUpdatedEvent.on(handler);
    }

    private handleProjectUpdate(): void {
        const currentProjectName: string = ProjectContext.get().getProject().getName();

        new ProjectListWithMissingRequest().sendAndParse().then((projects: Project[]) => {
            ProjectSelectionDialog.get().setProjects(projects);
            const project: Project = projects.find((p: Project) => p.getName() === currentProjectName);
            this.selectedProjectViewer.setObject(project);
            this.selectedProjectViewer.toggleClass('multi-projects', projects.length > 1);
        }).catch(DefaultErrorHandler.handle);
    }

}
