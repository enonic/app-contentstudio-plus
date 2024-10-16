import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {VariantsListItemView} from './VariantsListItemView';

export class VariantsList
    extends ListBox<ContentSummaryAndCompareStatus> {

    private static SELECTED_CLASS = 'selected';

    private selectedView?: VariantsListItemView;

    constructor() {
        super('variants-widget-list');
    }

    protected getItemId(item: ContentSummaryAndCompareStatus): string {
        return item.getId();
    }

    protected createItemView(item: ContentSummaryAndCompareStatus, readOnly: boolean): VariantsListItemView {
        const view: VariantsListItemView = new VariantsListItemView().setItem(item);

        view.onClicked(() => {
            this.setViewSelected(view);
        });

        return view;
    }

    private setViewSelected(view: VariantsListItemView): void {
        const isAlreadySelected: boolean = view.hasClass(VariantsList.SELECTED_CLASS);
        this.selectedView?.removeClass(VariantsList.SELECTED_CLASS);
        this.selectedView = isAlreadySelected ? null : view;
        this.selectedView?.addClass(VariantsList.SELECTED_CLASS);
    }

    update(originalItem: ContentSummaryAndCompareStatus, variants: ContentSummaryAndCompareStatus[]): VariantsList {
        this.clearItems();
        this.appendChild(new H6El('variants-widget-list-subheader').setHtml(i18n('widget.variants.item.type.original')));
        this.addItems(originalItem);
        this.appendChild(new H6El('variants-widget-list-subheader').setHtml(i18n('widget.variants.list.header.variants')));
        this.addItems(variants);

        return this;
    }

    setActiveItemById(id: string): VariantsList {
        this.getItemViews().forEach((view: VariantsListItemView) => {
            if (view.getItemId() === id) {
                view.addClass('active');
                this.setViewSelected(view);
            } else {
                view.removeClass('active');
            }
        });

        return this;
    }
}
