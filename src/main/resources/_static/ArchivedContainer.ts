import {ContentId} from 'lib-contentstudio/app/content/ContentId';
import {ArchivedContainerJson} from './ArchivedContainerJson';

export class ArchivedContainer {

    private readonly id: string;

    private readonly contentIds: ContentId[];

    private readonly parent: string;

    private readonly archiveTime: Date;

    private constructor(json: ArchivedContainerJson) {
        this.id = json.id;
        this.contentIds = json.contentIds.map((id: string) => new ContentId(id));
        this.parent = json.parent;
        this.archiveTime = new Date(Date.parse(json.archiveTime));
    }

    static fromJson(json: ArchivedContainerJson): ArchivedContainer {
        return new ArchivedContainer(json);
    }

    getId(): string {
        return this.id;
    }

    getContentIds(): ContentId[] {
        return this.contentIds;
    }

    getParent(): string {
        return this.parent;
    }

    getArchivedTime(): Date {
        return this.archiveTime;
    }
}
