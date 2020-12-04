import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import * as Q from 'q';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ProjectListRequest} from 'lib-contentstudio/app/settings/resource/ProjectListRequest';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {ContentsExistRequest} from 'lib-contentstudio/app/resource/ContentsExistRequest';
import {ContentsExistResult} from 'lib-contentstudio/app/resource/ContentsExistResult';
import {LayerContent} from './LayerContent';
import {MultiLayersContentFilter} from './MultiLayersContentFilter';

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
        return new ProjectListRequest().sendAndParse().then((projects: Project[]) => {
            const loadPromises: Q.Promise<LayerContent>[] = [];

            projects.forEach((project) => {
                loadPromises.push(this.doLoadContentFromProject(project));
            });

            return Q.all(loadPromises);
        });
    }

    private doLoadContentFromProject(project: Project): Q.Promise<LayerContent> {
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
