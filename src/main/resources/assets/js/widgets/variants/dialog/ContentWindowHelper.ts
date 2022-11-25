import {ContentAppBarTabId} from 'lib-contentstudio/app/ContentAppBarTabId';
import {ContentEventsProcessor} from 'lib-contentstudio/app/ContentEventsProcessor';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {UrlAction} from 'lib-contentstudio/app/UrlAction';
import {UrlHelper} from 'lib-contentstudio/app/util/UrlHelper';

export class ContentWindowHelper {

    private readonly contentId: string;

    constructor(contentId: string) {
        this.contentId = contentId;
    }

    openEditWizard(): void {
        ContentEventsProcessor.openTab(this.createEditUrl(), ContentAppBarTabId.forEdit(this.contentId).toString());
    }

    private createEditUrl(): string {
        const path: string = `${ProjectContext.get().getProject().getName()}/${UrlAction.EDIT}/${this.contentId}`;
        return UrlHelper.getPrefixedUrl(path, '').replace('.plus', '');
    }
}