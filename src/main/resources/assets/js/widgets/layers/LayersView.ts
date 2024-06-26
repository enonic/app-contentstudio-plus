import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {LayerContentView} from './LayerContentView';
import {LayerContent} from './LayerContent';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {LayerContentViewRelation} from './LayerContentViewRelation';

export class LayersView extends ListBox<LayerContent> {

    private static EXPANDED_CLASS = `${LayerContentView.VIEW_CLASS}-expanded`;

    private activeItemView: LayerContentView;

    constructor() {
        super('layers-view');
    }

    createItemView(item: LayerContent, readOnly: boolean): LayerContentView {
        const itemContainer: LayerContentView = new LayerContentView(item);

        itemContainer.getDataBlock().onClicked(() => {
            if (this.activeItemView) {
                this.activeItemView.removeClass(LayersView.EXPANDED_CLASS);
            }

            if (this.activeItemView === itemContainer) {
                this.activeItemView = null;
                return;
            }

            this.activeItemView = itemContainer;
            this.activeItemView.addClass(LayersView.EXPANDED_CLASS);
        });

        if (item.getProject().getName() === ProjectContext.get().getProject().getName()) {
            this.activeItemView = itemContainer;
            this.activeItemView.addClass(LayersView.EXPANDED_CLASS);
        }

        return itemContainer;
    }

    getItemId(item: LayerContent): string {
        return item.hasItem() ? `${item.getItem().getId()}:${item.getProject().getName()}` : item.getProject().getName();
    }

    setItems(items: LayerContent[], silent?: boolean): void {
        super.setItems(this.filterWidgetItems(items), silent);

        const totalDescendants: number = this.countDescendants(ProjectContext.get().getProject().getName(), items);

        if (totalDescendants > 0) {
            this.appendMoreBlockToLastItem(totalDescendants);
        }

        if (this.getItemCount() < 2) {
            return;
        }

        this.hideInheritedItems();
    }

    private countDescendants(projectName: string, items: LayerContent[]): number {
        let total = 0;

        const children: LayerContent[] = items.filter((item: LayerContent) => item.getProject().getParents().indexOf(projectName) >= 0);

        children.forEach((child: LayerContent) => {
            total += 1;
            total += this.countDescendants(child.getProjectName(), items);
        });

        return total;
    }

    private appendMoreBlockToLastItem(more: number): void {
        const relationBlock: LayerContentViewRelation = new LayerContentViewRelation(`${LayerContentView.VIEW_CLASS}-relation`);
        this.appendChild(relationBlock);
        this.getItemViews().pop().addClass('has-children');

        const moreButtonEl: DivEl = new DivEl('has-children-button');
        moreButtonEl.setHtml(i18n('widget.layers.more', more));
        relationBlock.appendChild(moreButtonEl);
    }

    private filterWidgetItems(items: LayerContent[]): LayerContent[] {
        const result: LayerContent[] = [];

        let projectsNames: string[] = [ProjectContext.get().getProject().getName()];
        let layerContent: LayerContent = items.find((item: LayerContent) => projectsNames.indexOf(item.getProjectName()) >= 0);

        while (layerContent) {
            result.unshift(layerContent);
            projectsNames = layerContent.getProject().getParents();
            layerContent = projectsNames ? items.find((item: LayerContent) => projectsNames.indexOf(item.getProjectName()) >= 0) : null;
        }

        return result;
    }

    private hideInheritedItems(): void {
        const reversedItemViews: LayerContentView[] = this.getItemViews().reverse() as LayerContentView[];

        let parentIndex = -1;
        reversedItemViews.find((item: LayerContentView, index: number) => {
            parentIndex = index;
            return (index !== 0 && item.hasItem() && !item.getItem().isDataInherited()) || index === reversedItemViews.length -1;
        });

        const totalBetweenCurrentAndParent: number = parentIndex - 1;

        if (totalBetweenCurrentAndParent > 0) {
            this.hideItemsBetween(0, parentIndex);
        }

        if (parentIndex < reversedItemViews.length - 1) {
            this.hideItemsBetween(parentIndex, reversedItemViews.length);
        }
    }

    private hideItemsBetween(itemIndex: number, parentIndex: number): void {
        const reversedItemViews: LayerContentView[] = this.getItemViews().reverse() as LayerContentView[];
        const currentItem: LayerContentView = reversedItemViews[itemIndex];
        currentItem.addClass('has-hidden-parents');

        const showParentsButtonEl: DivEl = new DivEl('show-parents-button');
        showParentsButtonEl.setHtml(i18n('widget.layers.showmore', parentIndex - itemIndex -1));
        currentItem.getRelationBlock().appendChild(showParentsButtonEl);

        const hiddenItems: LayerContentView[] = [];

        for (let i: number = itemIndex + 1; i < parentIndex; i++) {
            const itemToHide: LayerContentView = reversedItemViews[i];
            hiddenItems.push(itemToHide);
            itemToHide.hide();
        }

        showParentsButtonEl.onClicked(() => {
            showParentsButtonEl.hide();
            currentItem.removeClass('has-hidden-parents');

            hiddenItems.forEach((hiddenItem: LayerContentView) => {
                hiddenItem.show();
            });
        });
    }

}
