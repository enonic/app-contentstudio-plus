import * as Q from 'q';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {WidgetItemView} from 'lib-contentstudio/app/view/context/WidgetItemView';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {i18n} from 'lib-admin-ui/util/Messages';

export class ArchiveStatusWidgetItemView
    extends WidgetItemView {

    private content: ContentSummaryAndCompareStatus;

    private statusEl: SpanEl;

    constructor() {
        super('status-widget-item-view');
    }

    public setContentAndUpdateView(item: ContentSummaryAndCompareStatus): Q.Promise<any> {
        this.content = item;
        return this.layout();

        return Q<any>(null);
    }

    public layout(): Q.Promise<any> {
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
