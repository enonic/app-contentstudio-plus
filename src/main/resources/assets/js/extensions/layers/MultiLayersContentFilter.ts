import {LayerContent} from './LayerContent';

export class MultiLayersContentFilter {

    private items: LayerContent[];

    filter(layerContents: LayerContent[]): LayerContent[] {
        this.items = layerContents;

        return layerContents.filter((layerContent: LayerContent) => {
            if (layerContent.hasItem()) {
                return true;
            }

            return this.hasNonEmptyParent(layerContent) && this.hasNonEmptyDescendant(layerContent);
        });
    }

    private hasNonEmptyParent(item: LayerContent): boolean {
        let hasParentWithItem = false;
        let parent: LayerContent = this.findParent(item);

        while (parent && !hasParentWithItem) {
            if (parent.hasItem()) {
                hasParentWithItem = true;
            }

            parent = this.findParent(parent);
        }

        return hasParentWithItem;
    }

    private findParent(layerContent: LayerContent): LayerContent {
        return this.items.find((lc: LayerContent) => layerContent.getProject().getParents()?.indexOf(lc.getProjectName()) >= 0);
    }

    private hasNonEmptyDescendant(item: LayerContent): boolean {
        if (item.hasItem()) {
            return true;
        }

        return this.findChildren(item).some((child: LayerContent) => this.hasNonEmptyDescendant(child));
    }

    private findChildren(item: LayerContent): LayerContent[] {
        return this.items.filter((lc: LayerContent) => item.getProject().getParents()?.indexOf(lc.getProjectName()) >= 0);
    }
}
