import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {Project} from 'lib-contentstudio/app/settings/data/project/Project';
import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';

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

        const other: LayerContent = <LayerContent>o;

        return ObjectHelper.equals(this.project, other.project) && ObjectHelper.equals(this.item, other.item);
    }

    shallowEquals(other: LayerContent): boolean {
        return ObjectHelper.anyEquals(this.project?.getName(), other.project?.getName()) &&
               ObjectHelper.anyEquals(this.item?.getId(), other.item?.getId());
    }
}
