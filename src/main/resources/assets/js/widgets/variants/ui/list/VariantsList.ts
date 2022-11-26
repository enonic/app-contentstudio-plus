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
            const isAlreadySelected: boolean = view.hasClass(VariantsList.SELECTED_CLASS);
            this.selectedView?.removeClass(VariantsList.SELECTED_CLASS);
            this.selectedView = isAlreadySelected ? null : view;
            this.selectedView?.addClass(VariantsList.SELECTED_CLASS);
        });

        return view;
    }

    update(originalItem: ContentSummaryAndCompareStatus, variants: ContentSummaryAndCompareStatus[]): VariantsList {
        this.clearItems();
        this.appendChild(new H6El('variants-widget-list-subheader').setHtml(i18n('widget.variants.item.type.original')));
        this.addItem(originalItem);
        this.appendChild(new H6El('variants-widget-list-subheader').setHtml(i18n('widget.variants.list.header.variants')));
        this.addItems(variants);

        return this;
    }

    setActiveItemById(id: string): VariantsList {
        this.getItemViews().forEach((view: VariantsListItemView) => {
            view.toggleClass('active', view.getItemId() === id);
        });

        return this;
    }
}
