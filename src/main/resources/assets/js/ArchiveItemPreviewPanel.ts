import {ArchiveItemPreviewToolbar} from './ArchiveItemPreviewToolbar';
import {IsRenderableRequest} from 'lib-contentstudio/app/resource/IsRenderableRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ItemPreviewPanel} from 'lib-admin-ui/app/view/ItemPreviewPanel';
import {ImgEl} from 'lib-admin-ui/dom/ImgEl';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {i18n} from 'lib-admin-ui/util/Messages';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {MediaAllowsPreviewRequest} from 'lib-contentstudio/app/resource/MediaAllowsPreviewRequest';
import {UrlHelper} from 'lib-contentstudio/app/util/UrlHelper';
import {ImageUrlResolver} from 'lib-contentstudio/app/util/ImageUrlResolver';
import {ContentTypeName} from 'lib-admin-ui/schema/content/ContentTypeName';
import {ContentItemPreviewPanel} from 'lib-contentstudio/app/view/ContentItemPreviewPanel';
import {ViewItem} from 'lib-admin-ui/app/view/ViewItem';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';


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
            new IsRenderableRequest(item.getData().getContentId())
                .setContentRootPath(ArchiveResourceRequest.ARCHIVE_PATH)
                .sendAndParse()
                .then((isRenderable: boolean) => {
                    item.getData().setRenderable(isRenderable);
                    this.renderableItems.set(item.getId(), isRenderable);
                    this.debouncedSetItem(item);
                }).catch(DefaultErrorHandler.handle);
        }
    }

    protected viewItemToContent(item: ArchiveContentViewItem): ContentSummaryAndCompareStatus {
        return item.getData();
    }

    protected isNonBinaryItemRenderable(item: ContentSummaryAndCompareStatus): boolean {
        return false;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-item-preview-panel');

            return rendered;
        });
    }
}
