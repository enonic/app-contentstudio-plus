import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentSummaryAndCompareStatusViewer} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatusViewer';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';

export class VariantsListItemViewBody extends DivEl {

    private viewer: ContentSummaryAndCompareStatusViewer;

    private statusEl: SpanEl;

    private item: ContentSummaryAndCompareStatus;

    constructor() {
        super('variants-widget-list-item-body');
    }

    setItem(item: ContentSummaryAndCompareStatus): VariantsListItemViewBody {
        this.item = item;

        if (this.isRendered()) {
            this.doSetItem();
        }

        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.viewer = new ContentSummaryAndCompareStatusViewer();
            this.statusEl = new SpanEl();
            const statusWrapper: DivEl = new DivEl('status').appendChild(this.statusEl);

            this.appendChildren(this.viewer, statusWrapper);

            if (this.item) {
                this.doSetItem();
            }

            return rendered;
        });
    }

    private doSetItem(): void {
        this.viewer.setObject(this.item);
        this.statusEl.setHtml(this.item.getStatusText()).setClass(this.item.getStatusClass());
    }
}
