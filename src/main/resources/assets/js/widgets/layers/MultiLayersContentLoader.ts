import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import * as Q from 'q';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ProjectListWithMissingRequest} from 'lib-contentstudio/app/settings/resource/ProjectListWithMissingRequest';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentsExistRequest} from 'lib-contentstudio/app/resource/ContentsExistRequest';
import {ContentsExistResult} from 'lib-contentstudio/app/resource/ContentsExistResult';
import {LayerContent} from './LayerContent';
import {MultiLayersContentFilter} from './MultiLayersContentFilter';
import {ProjectHelper} from 'lib-contentstudio/app/settings/data/project/ProjectHelper';

export class MultiLayersContentLoader {

    private item: ContentSummaryAndCompareStatus;

    load(): Q.Promise<LayerContent[]> {
        return this.loadSameContentInOtherProjects().then((layerContents: LayerContent[]) => this.filter(layerContents));
    }

    setItem(item: ContentSummaryAndCompareStatus) {
        this.item = item;
    }

    private filter(layerContents: LayerContent[]): LayerContent[] {
        return new MultiLayersContentFilter().filter(layerContents);
    }

    private loadSameContentInOtherProjects(): Q.Promise<LayerContent[]> {
        return new ProjectListWithMissingRequest().sendAndParse().then((projects: Project[]) => {
            const loadPromises: Q.Promise<LayerContent>[] = [];

            projects.forEach((project: Project) => {
                loadPromises.push(this.doLoadContentFromProject(project));
            });

            return Q.all(loadPromises);
        });
    }

    private doLoadContentFromProject(project: Project): Q.Promise<LayerContent> {
        if (!ProjectHelper.isAvailable(project)) {
            return Q(new LayerContent(null, project));
        }

        const id: string = this.item.getId();

        return new ContentsExistRequest([id])
            .setRequestProject(project)
            .sendAndParse()
            .then((result: ContentsExistResult) => {
                if (!!result.getContentsExistMap()[id]) {
                    return ContentSummaryAndCompareStatusFetcher.fetch(this.item.getContentId(), project.getName())
                        .then((item: ContentSummaryAndCompareStatus) => {
                            return new LayerContent(item, project);
                        });
                } else {
                    return new LayerContent(null, project);
                }
            });
    }
}
