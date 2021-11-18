import {WidgetConfig, Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import {LayersWidgetItemView} from './LayersWidgetItemView';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {RepositoryId} from 'lib-contentstudio/app/repository/RepositoryId';
import {ProjectGetRequest} from 'lib-contentstudio/app/settings/resource/ProjectGetRequest';
import * as Q from 'q';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';

export class LayersWidget
    extends Widget {

    private readonly layersWidgetItemView: LayersWidgetItemView;

    constructor(config: WidgetConfig) {
        super(config, AppHelper.getLayersWidgetClass());

        this.layersWidgetItemView = new LayersWidgetItemView();

        this.fetchContent().then((content: ContentSummaryAndCompareStatus) => {
            return this.layersWidgetItemView.setContentAndUpdateView(content);
        }).catch(DefaultErrorHandler.handle);
    }

    private initProjectContext(): Q.Promise<void> {
        const projectName: string = this.repository.replace(RepositoryId.CONTENT_REPO_PREFIX, '');

        return new ProjectGetRequest(projectName).sendAndParse().then((project: Project) => {
            ProjectContext.get().setProject(project);
            return Q(null);
        });
    }

    private fetchContent(): Q.Promise<ContentSummaryAndCompareStatus> {
        return new ContentSummaryAndCompareStatusFetcher().fetch(new ContentId(this.contentId));
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChild(this.layersWidgetItemView);
            return rendered;
        });
    }
}
