import { AppId } from "lib-contentstudio/app/AppId";

export class ArchiveAppId extends AppId {

    static ID: string = 'archive';

    constructor() {
        super(ArchiveAppId.ID);
    }

}