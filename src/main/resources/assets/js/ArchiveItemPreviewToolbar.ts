import * as Q from 'q';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
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
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {DateTimeFormatter} from 'lib-admin-ui/ui/treegrid/DateTimeFormatter';


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

    clearItem(): void {
        this.setItem(null);

        this.archivedEl.setHtml('');
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.insertChild(this.archivedEl, 1);

            return rendered;
        });
    }

    protected foldOrExpand(): void {
        return;
    }

    private updatedArchivedBlock(summary: ContentSummary): void {
        const status: string = i18n('status.archived');
        const archivedBy: PrincipalKey = summary.getArchivedBy();

        const versionsPromise: Q.Promise<ContentVersions> = new GetContentVersionsRequest(summary.getContentId()).sendAndParse();
        const principalPromise: Q.Promise<Principal> = archivedBy != null ? new GetPrincipalByKeyRequest(archivedBy).sendAndParse() : Q(
            null);

        Q.all([versionsPromise, principalPromise]).spread((versions: ContentVersions, principal: Principal) => {
            const when: string = DateTimeFormatter.createHtml(summary.getArchivedTime());
            const displayName: string = i18n('field.preview.toolbar.status',
                principal ? principal.getDisplayName() : PrincipalKey.ofAnonymous().getId());
            this.archivedEl.setHtml(`${status} ${when} ${displayName}`);
        }).catch(DefaultErrorHandler.handle);
    }

    private updateOriginalPathBlock(item: ArchiveContentViewItem): void {
        this.originalPathEl.setHtml(item.getOriginalFullPath());
    }
}
