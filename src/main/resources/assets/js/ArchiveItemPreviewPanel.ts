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


export class ArchiveItemPreviewPanel
    extends ItemPreviewPanel<ArchiveContentViewItem> {

    private renderableItems: Map<string, boolean> = new Map<string, boolean>();
    private image: ImgEl;
    private item: ArchiveContentViewItem;
    private previewMessage: DivEl;
    private debouncedSetItem: (item: ArchiveContentViewItem) => void;

    constructor() {
        super();

        this.initElements();
    }

    private initElements() {
        this.debouncedSetItem = AppHelper.runOnceAndDebounce(this.doSetItem.bind(this), 300);
        this.image = new ImgEl();

        const previewText = new SpanEl();
        previewText.setHtml(i18n('field.preview.notAvailable'));
        this.previewMessage = new DivEl('no-preview-message');
        this.previewMessage.appendChild(previewText);
    }

    private initListeners() {
        this.image.onLoaded((   ) => {
            this.mask.hide();
        });
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

    private doSetItem(item: ArchiveContentViewItem) {
        if (item && !item.equals(this.item)) {
            const contentSummary: ContentSummary = item.getData().getContentSummary();

            if (this.isMediaForPreview(contentSummary)) {
                this.setMediaPreviewMode(contentSummary);
            } else if (contentSummary.getType().isImage() || contentSummary.getType().isVectorMedia()) {
                this.setImagePreviewMode(contentSummary);
            } else {
                this.setMode('no-preview');
            }
        }

        this.toolbar.setItem(item);
        this.item = item;
    }

    private isMediaForPreview(content: ContentSummary) {
        const type: ContentTypeName = content.getType();

        return type.isAudioMedia() ||
               type.isDocumentMedia() ||
               type.isTextMedia() ||
               type.isVideoMedia();
    }

    private setMediaPreviewMode(contentSummary: ContentSummary) {
        new MediaAllowsPreviewRequest(contentSummary.getContentId()).setContentRootPath(ContentPath.ARCHIVE_ROOT).sendAndParse().then(
            (allows: boolean) => {
                if (allows) {
                    this.setMode('media-preview');
                    this.frame.setSrc(this.getMediaUrl(contentSummary));
                } else {
                    this.setMode('no-preview');
                }
            }).catch(DefaultErrorHandler.handle);
    }

    private getMediaUrl(contentSummary: ContentSummary): string {
        return UrlHelper.getCmsRestUri(
            `${UrlHelper.getCMSPath(ContentPath.ARCHIVE_ROOT)}/content/media/${contentSummary.getId()}?download=false#view=fit`);
    }

    private setImagePreviewMode(contentSummary: ContentSummary) {
        const imgUrlResolver: ImageUrlResolver = new ImageUrlResolver(ContentPath.ARCHIVE_ROOT)
            .setContentId(contentSummary.getContentId())
            .setTimestamp(contentSummary.getModifiedTime());

        if (!contentSummary.getType().isVectorMedia()) {
            imgUrlResolver.setSize(this.addImageSizeToUrl());
            this.setMode('image-preview');
        } else {
            this.setMode('svg-preview');
        }

        this.image.setSrc(imgUrlResolver.resolveForPreview());

        if (!this.image.isLoaded()) {
            this.showMask();
        }
    }

    private setMode(value: string) {
        if (value != 'media-preview') {
            this.frame.setSrc('about:blank');
        }
        this.removeClass('image-preview svg-preview media-preview no-preview');
        this.addClass(value);
    }

    private showMask() {
        if (this.isVisible()) {
            this.mask.show();
        }
    }

    private addImageSizeToUrl(): number {
        const imgWidth = this.getEl().getWidth();
        const imgHeight = this.getEl().getHeight() - this.toolbar.getEl().getHeight();
        const imgSize = Math.max(imgWidth, imgHeight);

        return imgSize;
    }

    clearItem() {
        (<ArchiveItemPreviewToolbar>this.toolbar).clearItem();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-item-preview-panel');

            this.wrapper.appendChild(this.image);
            this.wrapper.appendChild(this.previewMessage);
            return rendered;
        });
    }
}
