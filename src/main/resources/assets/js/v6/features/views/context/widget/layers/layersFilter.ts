import {isChildOf, type LayerContent} from './layerContent';

const findParent = (layer: LayerContent, all: LayerContent[]): LayerContent | undefined =>
    all.find(candidate => isChildOf(layer.project, candidate.project.name));

const findChildren = (layer: LayerContent, all: LayerContent[]): LayerContent[] =>
    all.filter(candidate => isChildOf(candidate.project, layer.project.name));

const hasNonEmptyAncestor = (layer: LayerContent, all: LayerContent[]): boolean => {
    const visited = new Set<string>([layer.project.name]);
    let parent = findParent(layer, all);

    while (parent && !visited.has(parent.project.name)) {
        if (parent.item) {
            return true;
        }
        visited.add(parent.project.name);
        parent = findParent(parent, all);
    }

    return false;
};

const hasNonEmptyDescendant = (layer: LayerContent, all: LayerContent[], visited: Set<string>): boolean => {
    if (layer.item) {
        return true;
    }
    if (visited.has(layer.project.name)) {
        return false;
    }
    visited.add(layer.project.name);

    return findChildren(layer, all).some(child => hasNonEmptyDescendant(child, all, visited));
};

export const filterLayers = (layers: LayerContent[]): LayerContent[] =>
    layers.filter(
        layer => !!layer.item || (hasNonEmptyAncestor(layer, layers) && hasNonEmptyDescendant(layer, layers, new Set())),
    );
