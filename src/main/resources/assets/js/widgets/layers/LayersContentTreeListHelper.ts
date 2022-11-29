import {LayerContent} from './LayerContent';

export class LayersContentTreeListHelper {

    private layerContents: LayerContent[];

    setItems(items: LayerContent[]): void {
        this.layerContents = items;
    }

    sort(): LayerContent[] {
        const result: LayerContent[] = [];

        const rootItems: LayerContent[] = this.getRootItems();

        rootItems.forEach((rootItem: LayerContent) => {
            result.push(...this.unwrapChildren(rootItem));
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

    private unwrapChildren(layerContent: LayerContent): LayerContent[] {
        const result: LayerContent[] = [layerContent];

        this.layerContents
            .filter((lc: LayerContent) => layerContent.getProject().getParents()?.indexOf(lc.getProjectName()) >= 0)
            .forEach((lc: LayerContent) => {
                result.push(...this.unwrapChildren(lc));
            });

        return result;
    }

    private getRootItems(): LayerContent[] {
        return this.layerContents.filter((item: LayerContent) => this.calcLevel(item) === 0);
    }

}
