import * as Q from 'q';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {DateTimeFormatter} from 'lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {ItemPreviewToolbar} from 'lib-admin-ui/app/view/ItemPreviewToolbar';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {Principal} from 'lib-admin-ui/security/Principal';
import {GetPrincipalByKeyRequest} from 'lib-contentstudio/app/resource/GetPrincipalByKeyRequest';
import {GetContentVersionsRequest} from 'lib-contentstudio/app/resource/GetContentVersionsRequest';
import {ContentVersions} from 'lib-contentstudio/app/ContentVersions';
import {ContentVersion} from 'lib-contentstudio/app/ContentVersion';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {ContentVersionPublishInfo} from 'lib-contentstudio/app/ContentVersionPublishInfo';


export class ArchiveItemPreviewToolbar
    extends ItemPreviewToolbar<ArchiveContentViewItem> {

    private readonly archivedEl: DivEl;

    private readonly originalPathEl: SpanEl;

    constructor() {
        super('archive-status-toolbar');

        this.archivedEl = new DivEl('archived');

        const originalPathWrapper = new DivEl('original-path');
        this.originalPathEl = new SpanEl('original-path-value');
        originalPathWrapper.appendChildren(new SpanEl().setHtml(i18n('preview.originalPath')), this.originalPathEl);

        this.appendChild(originalPathWrapper);
    }

    setItem(item: ArchiveContentViewItem): void {
        super.setItem(item);

        if (item) {
            const summary: ContentSummary = item.getData().getContentSummary();
            this.updatedArchivedBlock(summary);
            this.updateOriginalPathBlock(item);
        }
    }

    private updatedArchivedBlock(summary: ContentSummary) {
        const status: string = i18n('status.archived');
        const modifier: string = summary.getModifier();

        const versionsPromise: Q.Promise<ContentVersions> = new GetContentVersionsRequest(summary.getContentId()).sendAndParse();
        const principalPromise: Q.Promise<Principal> = new GetPrincipalByKeyRequest(PrincipalKey.fromString(modifier)).sendAndParse();

        Q.all([versionsPromise, principalPromise]).spread((versions: ContentVersions, principal: Principal) => {
            const when: string = this.getArchivedDate(versions);
            const displayName: string = i18n('field.preview.toolbar.status', principal.getDisplayName());
            this.archivedEl.setHtml(`${status} ${when} ${displayName}`);
        }).catch(DefaultErrorHandler.handle);
    }

    private getArchivedDate(versions: ContentVersions): string {
        const publishInfo: ContentVersionPublishInfo = versions.getActiveVersion().getPublishInfo();

        if (publishInfo?.isArchived()) {
            return DateTimeFormatter.createHtmlNoTimestamp(publishInfo.getTimestamp());
        }

        return DateTimeFormatter.createHtmlNoTimestamp(versions.getActiveVersion().getModified());
    }

    private updateOriginalPathBlock(item: ArchiveContentViewItem) {
        this.originalPathEl.setHtml(item.getOriginalFullPath());
    }

    clearItem(): void {
        this.setItem(null);

        this.archivedEl.setHtml('');
    }

    protected foldOrExpand(): void {
        return;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.insertChild(this.archivedEl, 1);

            return rendered;
        });
    }
}
