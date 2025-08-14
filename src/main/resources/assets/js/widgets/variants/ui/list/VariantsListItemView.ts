import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {LiEl} from '@enonic/lib-admin-ui/dom/LiEl';
import Q from 'q';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {VariantsListItemViewBody} from './VariantsListItemViewBody';
import {VariantsListItemViewFooter} from './VariantsListItemViewFooter';

export class VariantsListItemView extends LiEl {

    private header: DivEl;

    private body: VariantsListItemViewBody;

    private footer: VariantsListItemViewFooter;

    private item: ContentSummaryAndCompareStatus;

    constructor() {
        super('variants-widget-list-item');
    }

    setItem(item: ContentSummaryAndCompareStatus): VariantsListItemView {
        this.item = item;

        if (this.isRendered()) {
            this.doSetItem();
        }

        return this;
    }


    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.header = new DivEl('variants-widget-list-item-header');
            this.body = new VariantsListItemViewBody();
            this.footer = new VariantsListItemViewFooter();

            this.appendChildren(this.header, this.body, this.footer);

            if (this.item) {
                this.doSetItem();
            }

            return rendered;
        });
    }

    private doSetItem(): void {
        this.body.setItem(this.item);
        this.footer.setItem(this.item);
        this.toggleClass('original', !this.item.isVariant());
    }

    getItemId(): string {
        return this.item?.getId();
    }
}