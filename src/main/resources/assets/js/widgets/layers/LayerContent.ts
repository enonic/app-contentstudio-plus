import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';

export class LayerContent {

    private readonly item: ContentSummaryAndCompareStatus;

    private readonly project: Project;

    constructor(item: ContentSummaryAndCompareStatus, project: Project) {
        this.item = item;
        this.project = project;
    }

    getItem(): ContentSummaryAndCompareStatus {
        return this.item;
    }

    getProject(): Project {
        return this.project;
    }

    getItemId(): string {
        return this.item.getId();
    }

    getContentId(): ContentId {
        return this.item.getContentId();
    }

    getProjectName(): string {
        return this.project.getName();
    }

    hasItem(): boolean {
        return !!this.item;
    }
}
