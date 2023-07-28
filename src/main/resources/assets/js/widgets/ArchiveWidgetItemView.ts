import * as Q from 'q';
import {WidgetItemView} from 'lib-contentstudio/app/view/context/WidgetItemView';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveContentViewer} from '../ArchiveContentViewer';

export class ArchiveWidgetItemView
    extends WidgetItemView {

    private viewer: ArchiveContentViewer;

    constructor() {
        super('archive-widget-item-view');
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
