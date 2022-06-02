import {ListBox} from '@enonic/lib-admin-ui/ui/selector/list/ListBox';
import {LayerContent} from './LayerContent';
import {LayerContentViewDataBlock} from './LayerContentViewDataBlock';
import {LayerContentView} from './LayerContentView';
import {LayersContentTreeListHelper} from './LayersContentTreeListHelper';


export class LayersContentTreeList
    extends ListBox<LayerContent> {

    private helper: LayersContentTreeListHelper;

    private activeItemView: LayerContentViewDataBlock;

    constructor() {
        super('layers-content-tree-list');

        this.helper = new LayersContentTreeListHelper();
    }

    setItems(items: LayerContent[], silent?: boolean): void {
        this.helper.setItems(items);
        super.setItems(this.helper.sort(), silent);
    }

    protected getItemId(item: LayerContent): string {
        const projectName: string = item.getProject().getName();
        const contentId: string = item.hasItem() ? item.getItemId() : '';
        return `${projectName}:${contentId}`;
    }

    protected createItemView(item: LayerContent, readOnly: boolean): LayerContentViewDataBlock {
        const itemView: LayerContentViewDataBlock = new LayerContentViewDataBlock(item, `${LayerContentView.VIEW_CLASS}-data`);
        itemView.addClass(`level-${this.helper.calcLevel(item)}`);

        itemView.onClicked(() => {
            if (this.activeItemView) {
                this.activeItemView.removeClass('expanded');
            }

            if (this.activeItemView === itemView) {
                this.activeItemView = null;
                return;
            }

            this.activeItemView = itemView;
            this.activeItemView.addClass('expanded');
        });

        return itemView;
    }

}
