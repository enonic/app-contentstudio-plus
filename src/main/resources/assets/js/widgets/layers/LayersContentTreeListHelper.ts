import {LayerContent} from './LayerContent';

export class LayersContentTreeListHelper {

    private layerContents: LayerContent[];

    setItems(items: LayerContent[]): void {
        this.layerContents = items;
    }

    toFlatTree(): LayerContent[] {
        return this.removeDuplicates(this.flattenLayerContents());
    }

    private flattenLayerContents(): LayerContent[] {
        const items: LayerContent[] = [];

        const rootItems: LayerContent[] = this.getRootItems();

        rootItems.forEach((rootItem: LayerContent) => {
            items.push(...this.unWrapChildren(rootItem));
        });

        return items;
    }

    private removeDuplicates(items: LayerContent[]): LayerContent[] {
        const result: LayerContent[] = [];

        items.forEach((item: LayerContent) => {
           if (!result.some((resultItem: LayerContent) => resultItem.shallowEquals(item))) {
               result.push(item);
           }
        });

        return result;
    }

    calcLevel(item: LayerContent): number {
        let level = 0;
        let parent: LayerContent = this.findParent(item);

        while (parent) {
            level += 1;
            parent = this.findParent(parent);
        }

        return level;
    }

    findParent(layerContent: LayerContent): LayerContent {
        return this.layerContents.find((lc: LayerContent) => layerContent.getProject().getParents()?.indexOf(lc.getProjectName()) >= 0);
    }

    private unWrapChildren(layerContent: LayerContent): LayerContent[] {
        const result: LayerContent[] = [layerContent];

        this.layerContents
            .filter((lc: LayerContent) => lc.getProject().getParents()?.indexOf(layerContent.getProjectName()) >= 0)
            .forEach((lc: LayerContent) => {
                result.push(...this.unWrapChildren(lc));
            });

        return result;
    }

    private getRootItems(): LayerContent[] {
        return this.layerContents.filter((item: LayerContent) => this.calcLevel(item) === 0);
    }

}
