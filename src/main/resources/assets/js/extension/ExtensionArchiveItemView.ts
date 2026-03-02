import Q from 'q';
import {ExtensionItemView} from '@enonic/lib-contentstudio/app/view/context/ExtensionItemView';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveContentViewer} from '../ArchiveContentViewer';

export class ExtensionArchiveItemView
    extends ExtensionItemView {

    private viewer: ArchiveContentViewer;

    constructor() {
        super('extension-archive-item-view');
        this.initViewer();
    }

    getViewer(): ArchiveContentViewer {
        return this.viewer;
    }

    setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<void> {
        if (item) {
            this.viewer.setObject(item);
        }

        return Q();
    }

    setSubName(subName: string): void {
        if (this.viewer) {
            this.viewer.getNamesAndIconView().setSubName(subName);
        }
    }

    whenRendered(callback: () => void): void {
        this.viewer.whenRendered(callback);
    }

    private initViewer(): void {
        this.viewer = new ArchiveContentViewer();
        this.appendChild(this.viewer);
    }
}
