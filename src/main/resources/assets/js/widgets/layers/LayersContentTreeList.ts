import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {LayerContent} from './LayerContent';
import {LayerContentView} from './LayerContentView';
import {LayersContentTreeListHelper} from './LayersContentTreeListHelper';

export class LayersContentTreeList
    extends ListBox<LayerContent> {

    public static readonly HIDE_OTHER_TREES_CLASS: string = 'hide-other-trees';

    private helper: LayersContentTreeListHelper;

    private activeItemView: LayerContentView;

    private hasLayersFromOtherTrees: boolean = false;

    constructor() {
        super(`layers-content-tree-list ${LayersContentTreeList.HIDE_OTHER_TREES_CLASS}`);

        this.helper = new LayersContentTreeListHelper();
    }

    setItems(items: LayerContent[], silent?: boolean): void {
        this.hasLayersFromOtherTrees = false;
        this.addClass(LayersContentTreeList.HIDE_OTHER_TREES_CLASS);
        this.helper.setItems(items);
        super.setItems(this.helper.toFlatTree(), silent);
    }

    protected getItemId(item: LayerContent): string {
        const projectName: string = item.getProject().getName();
        const contentId: string = item.hasItem() ? item.getItemId() : '';
        return `${projectName}:${contentId}`;
    }

    protected createItemView(item: LayerContent, readOnly: boolean): LayerContentView {
        const itemView: LayerContentView = new LayerContentView(item, this.helper.calcLevel(item));
        itemView.addClass(`layers-content-tree-list-item`);
        const isFromCurrentProjectTree = this.helper.isFromCurrentProjectTree(item);
        itemView.toggleClass('non-current-tree', !isFromCurrentProjectTree);
        this.hasLayersFromOtherTrees = !isFromCurrentProjectTree || this.hasLayersFromOtherTrees;

        itemView.onClicked(() => {
            if (this.activeItemView) {
                this.activeItemView.getDataBlock().removeClass('expanded');
            }

            if (this.activeItemView === itemView) {
                this.activeItemView = null;
                return;
            }

            this.activeItemView = itemView;
            this.activeItemView.getDataBlock().addClass('expanded');
        });

        if (this.helper.isCurrentProject(item)) {
            this.activeItemView = itemView;
            this.activeItemView.getDataBlock().addClass('expanded');
        }

        return itemView;
    }

    hasLayersToHide(): boolean {
        return this.hasLayersFromOtherTrees;
    }

    toggleHiddenLayersVisible(): void {
        this.toggleClass(LayersContentTreeList.HIDE_OTHER_TREES_CLASS, !this.hasClass(LayersContentTreeList.HIDE_OTHER_TREES_CLASS));
    }
}
