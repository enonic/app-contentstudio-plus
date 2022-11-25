import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import * as Q from 'q';
import {VariantsListItemViewMenuButton} from './VariantsListItemViewMenuButton';

export class VariantsListItemViewFooter extends DivEl {

    private item: ContentSummaryAndCompareStatus;

    private menuButton: VariantsListItemViewMenuButton;

    constructor() {
        super('variants-widget-list-item-footer');
    }

    setItem(item: ContentSummaryAndCompareStatus): VariantsListItemViewFooter {
        this.item = item;

        if (this.isRendered()) {
            this.doSetItem();
        }

        return this;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.menuButton = new VariantsListItemViewMenuButton();

            this.appendChild(this.menuButton);

            if (this.item) {
                this.doSetItem();
            }

            return rendered;
        });
    }

    private doSetItem(): void {
        this.menuButton.setItem(this.item);
    }
}
