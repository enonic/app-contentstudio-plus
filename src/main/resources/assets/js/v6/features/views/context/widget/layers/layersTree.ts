import {ProjectsChainBlock} from '@enonic/lib-contentstudio/app/settings/wizard/panel/form/element/ProjectsChainBlock';
import {Project} from '@enonic/lib-contentstudio/app/settings/data/project/Project';
import {LayerContent} from '../../../../../../extension/layers/LayerContent';

export type LayerRow = {
    item: LayerContent;
    level: number;
    isCurrent: boolean;
    isInChain: boolean;
    key: string;
};

const buildLevelMap = (all: LayerContent[]): Map<string, number> => {
    const byProject = new Map<string, LayerContent>();
    all.forEach(lc => byProject.set(lc.getProjectName(), lc));

    const levels = new Map<string, number>();
    const compute = (item: LayerContent, visiting: Set<string>): number => {
        const name = item.getProjectName();
        const cached = levels.get(name);
        if (cached !== undefined) return cached;
        if (visiting.has(name)) return 0; // cycle guard
        visiting.add(name);

        const parents = item.getProject().getParents() ?? [];
        let level = 0;
        for (const parentName of parents) {
            const parent = byProject.get(parentName);
            if (parent) {
                level = compute(parent, visiting) + 1;
                break;
            }
        }

        visiting.delete(name);
        levels.set(name, level);
        return level;
    };

    all.forEach(item => compute(item, new Set<string>()));
    return levels;
};

const findChildren = (parent: LayerContent, all: LayerContent[]): LayerContent[] =>
    all.filter((lc: LayerContent) => lc.getProject().getParents()?.indexOf(parent.getProjectName()) >= 0);

const getRowKey = (item: LayerContent): string =>
    `${item.getProject().getName()}:${item.hasItem() ? item.getItemId() : ''}`;

const unwrap = (root: LayerContent, all: LayerContent[], visited: Set<string>): LayerContent[] => {
    const name = root.getProjectName();
    if (visited.has(name)) return [];
    visited.add(name);

    const out: LayerContent[] = [root];
    findChildren(root, all).forEach(child => out.push(...unwrap(child, all, visited)));
    return out;
};

const removeDuplicates = (items: LayerContent[]): LayerContent[] => {
    const seen = new Set<string>();
    return items.filter(item => {
        const key = getRowKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const flatten = (all: LayerContent[], levels: Map<string, number>): LayerContent[] => {
    const roots = all.filter(item => (levels.get(item.getProjectName()) ?? 0) === 0);
    const ordered: LayerContent[] = [];
    const visited = new Set<string>();
    roots.forEach(root => ordered.push(...unwrap(root, all, visited)));
    return removeDuplicates(ordered);
};

export type LayersTree = {
    all: LayerRow[];
    visible: LayerRow[];
};

export const buildLayersTree = (items: LayerContent[], activeProjectName: string): LayersTree => {
    const projects: Project[] = items.map(lc => lc.getProject());
    const currentChain: Project[] = ProjectsChainBlock.buildProjectsChain(activeProjectName, projects);
    const currentChainNames = new Set<string>(currentChain.map(p => p.getName()));

    const isFromCurrentTree = (item: LayerContent): boolean => {
        const itemProjectName = item.getProject().getName();
        if (currentChainNames.has(itemProjectName)) {
            return true;
        }
        const itemChain = ProjectsChainBlock.buildProjectsChain(itemProjectName, projects);
        return itemChain.some(p => p.getName() === activeProjectName);
    };

    const levels = buildLevelMap(items);
    const ordered = flatten(items, levels);
    const visibleItems = ordered.filter(isFromCurrentTree);

    const toRow = (item: LayerContent): LayerRow => ({
        item,
        level: levels.get(item.getProjectName()) ?? 0,
        isCurrent: item.getProject().getName() === activeProjectName,
        isInChain: currentChainNames.has(item.getProject().getName()),
        key: getRowKey(item),
    });

    return {
        all: ordered.map(toRow),
        visible: visibleItems.map(toRow),
    };
};
