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
        const when: string = DateTimeFormatter.createHtmlNoTimestamp(summary.getModifiedTime());
        const modifier: string = summary.getModifier();

        this.getPrincipalDisplayName(modifier).then((displayName: string) => {
            this.archivedEl.setHtml(`${status} ${when} ${displayName}`);
        });
    }

    private getPrincipalDisplayName(modifier: string): Q.Promise<string> {
        return new GetPrincipalByKeyRequest(PrincipalKey.fromString(modifier)).sendAndParse()
            .then((user: Principal) => {
                return i18n('field.preview.toolbar.status', user.getDisplayName());
            }).catch(() => {
                return modifier;
            });
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
