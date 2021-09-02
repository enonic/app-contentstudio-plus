import {ContentItemPreviewPanel} from 'lib-contentstudio/app/view/ContentItemPreviewPanel';
import {ContentItemPreviewToolbar} from 'lib-contentstudio/app/view/ContentItemPreviewToolbar';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveItemPreviewToolbar} from './ArchiveItemPreviewToolbar';
import {ContentSummaryAndCompareStatusFetcher} from 'lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {IsRenderableRequest} from 'lib-contentstudio/app/resource/IsRenderableRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';

export class ArchiveItemPreviewPanel
    extends ContentItemPreviewPanel {

    private renderableItems: Map<string, boolean> = new Map<string, boolean>();

    createToolbar(): ContentItemPreviewToolbar {
        return <any>new ArchiveItemPreviewToolbar();
    }

    setItem(item: ContentSummaryAndCompareStatus, force?: boolean): void {
        if (this.renderableItems.has(item.getId())) {
            super.setItem(item, force);
        } else {
            new IsRenderableRequest(item.getContentId()).sendAndParse().then((isRenderable: boolean) => {
                item.setRenderable(isRenderable);
                this.renderableItems.set(item.getId(), isRenderable);
                super.setItem(item);
            }).catch(DefaultErrorHandler.handle);
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-item-preview-panel');

            return rendered;
        });
    }
}
