import Q from 'q';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {ExtensionItemView} from '@enonic/lib-contentstudio/app/view/context/ExtensionItemView';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class ExtensionArchiveStatusItemView
    extends ExtensionItemView {

    private content: ContentSummaryAndCompareStatus;

    private statusEl: SpanEl;

    constructor() {
        super('extension-status-item-view');
    }

    public setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<void> {
        this.content = item;
        return this.layout();
    }

    public layout(): Q.Promise<void> {
        return super.layout().then(() => {
            if (!this.statusEl) {
                this.statusEl = new SpanEl();
                this.appendChild(this.statusEl);
            }

            if (this.content) {
                this.statusEl.setHtml(i18n('status.archived'));
                this.statusEl.addClass('archived');
            }
        });
    }
}
