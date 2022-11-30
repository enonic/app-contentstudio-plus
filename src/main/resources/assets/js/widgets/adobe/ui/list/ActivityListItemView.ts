import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {LiEl} from '@enonic/lib-admin-ui/dom/LiEl';
import * as Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class ActivityListItemView extends LiEl {

    private header: DivEl;

    private item: ContentSummaryAndCompareStatus;

    constructor() {
        super('variants-widget-list-item');
    }

    setItem(item: ContentSummaryAndCompareStatus): ActivityListItemView {
        this.item = item;

        if (this.isRendered()) {
            this.doSetItem();
        }

        return this;
    }


    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.header = new DivEl('variants-widget-list-item-header');

            this.appendChildren(this.header);

            if (this.item) {
                this.doSetItem();
            }

            return rendered;
        });
    }

    private doSetItem(): void {
        this.toggleClass('original', !this.item.isVariant());
    }

    getItemId(): string {
        return this.item?.getId();
    }
}
