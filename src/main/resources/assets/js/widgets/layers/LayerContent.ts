import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {LayerContentJson} from '../../resource/json/LayerContentJson';
import {LayerContentHelper} from './LayerContentHelper';

export class LayerContent implements Equitable {

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

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, LayerContent)) {
            return false;
        }

        const other: LayerContent = o as LayerContent;

        return ObjectHelper.equals(this.project, other.project) && ObjectHelper.equals(this.item, other.item);
    }

    shallowEquals(other: LayerContent): boolean {
        return ObjectHelper.anyEquals(this.project?.getName(), other.project?.getName()) &&
               ObjectHelper.anyEquals(this.item?.getId(), other.item?.getId());
    }

    static fromJson(json: LayerContentJson): LayerContent {
        return LayerContentHelper.jsonToLayerContent(json);
    }
}
