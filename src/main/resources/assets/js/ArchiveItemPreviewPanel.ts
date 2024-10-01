import {ArchiveItemPreviewToolbar} from './ArchiveItemPreviewToolbar';
import {IsRenderableRequest} from 'lib-contentstudio/app/resource/IsRenderableRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ContentItemPreviewPanel} from 'lib-contentstudio/app/view/ContentItemPreviewPanel';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {StatusCode} from '@enonic/lib-admin-ui/rest/StatusCode';

export class ArchiveItemPreviewPanel
    extends ContentItemPreviewPanel {

    protected item: ArchiveContentViewItem;

    private renderableItems: Map<string, boolean> = new Map<string, boolean>();

    constructor() {
        super(ContentPath.ARCHIVE_ROOT);
    }

    createToolbar(): ArchiveItemPreviewToolbar {
        return new ArchiveItemPreviewToolbar();
    }

    setItem(item: ArchiveContentViewItem): void {
        if (this.renderableItems.has(item.getId())) {
            this.debouncedSetItem(item);
        } else {
            new IsRenderableRequest(item.getContentSummary())
                .sendAndParse()
                .then((statusCode: number) => {
                    const isRenderable = statusCode === StatusCode.OK;
                    item.setRenderable(isRenderable);
                    this.renderableItems.set(item.getId(), isRenderable);
                    this.debouncedSetItem(item);
                }).catch(DefaultErrorHandler.handle);
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-item-preview-panel');

            return rendered;
        });
    }

    protected viewItemToContent(item: ArchiveContentViewItem): ContentSummaryAndCompareStatus {
        return item;
    }

    protected isNonBinaryItemRenderable(item: ContentSummaryAndCompareStatus): boolean {
        return false;
    }
}
