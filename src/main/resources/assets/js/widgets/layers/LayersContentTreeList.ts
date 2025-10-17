import {UlEl} from '@enonic/lib-admin-ui/dom/UlEl';
import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {LayerContent} from './LayerContent';
import {LayerContentView} from './LayerContentView';
import {LayersContentTreeListHelper} from './LayersContentTreeListHelper';

export class LayersContentTreeList
    extends ListBox<LayerContent> {

    private helper: LayersContentTreeListHelper;

    private activeItemView: LayerContentView;

    private allItems: LayerContent[] = [];

    private previousLevel: number = 0;

    private wrappers: Map<number, UlEl> = new Map<number, UlEl>();

    private previousItemView: LayerContentView;

    constructor() {
        super(`layers-content-tree-list`);

        this.helper = new LayersContentTreeListHelper();
    }

    setItems(items: LayerContent[], silent?: boolean): void {
        this.resetWrappers();
        this.helper.setItems(items);
        super.setItems(this.helper.toFlatTree(), silent);
    }

    setAllItems(items: LayerContent[], silent?: boolean): void {
        this.allItems = items;

        this.helper.setItems(this.allItems);

        const itemsFromCurrentProjectTree: LayerContent[] =
            items.filter((item: LayerContent) => this.helper.isFromCurrentProjectTree(item));

        this.setItems(itemsFromCurrentProjectTree);
    }

    getAllItems(): LayerContent[] {
        return this.allItems;
    }

    protected getItemId(item: LayerContent): string {
        const projectName: string = item.getProject().getName();
        const contentId: string = item.hasItem() ? item.getItemId() : '';
        return `${projectName}:${contentId}`;
    }

    protected addItemView(item: LayerContent, readOnly: boolean = false): LayerContentView {
        const itemView: LayerContentView = this.createItemView(item, readOnly);
        this.itemViews.set(this.getItemId(item), itemView);
        const currentLevel = itemView.getLevel();
        const wrapper = currentLevel > this.previousLevel ?
                        new UlEl('layers-item-view-wrapper') : this.wrappers.get(currentLevel);

        if (currentLevel > this.previousLevel) {
            this.previousItemView.setChildBlock(wrapper);
            this.wrappers.set(currentLevel, wrapper);
        }

        wrapper.appendChild(itemView);

        this.previousLevel = currentLevel;
        this.previousItemView = itemView;

        return itemView;
    }

    protected createItemView(item: LayerContent, readOnly: boolean): LayerContentView {
        const itemView: LayerContentView = new LayerContentView(item, this.helper.calcLevel(item));
        itemView.addClass(`layers-content-tree-list-item`);

        itemView.onClicked((e: MouseEvent) => {
            if (this.activeItemView) {
                this.activeItemView.removeClass('expanded');
            }

            if (this.activeItemView === itemView) {
                this.activeItemView = null;
                e.stopPropagation();
                return;
            }

            this.activeItemView = itemView;
            this.activeItemView.addClass('expanded');

            e.stopPropagation();
        });

        if (this.helper.isCurrentProject(item)) {
            this.activeItemView = itemView;
            this.activeItemView.addClass('expanded');
        }

        return itemView;
    }

    hasLayersToHide(): boolean {
        return this.getAllItems().length > this.getItems().length;
    }

    private resetWrappers(): void {
        this.wrappers.clear();
        this.wrappers.set(0, this);
        this.previousLevel = 0;
        this.previousItemView = null;
    }
}
