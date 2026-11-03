import {getMainParent, isChildOf, type LayerContent, type LayerProject} from '../../../../shared/content/layerContent';

export type LayerRow = {
    item: LayerContent;
    level: number;
    isCurrent: boolean;
    isInChain: boolean;
    key: string;
};

const buildProjectsChain = (projectName: string, byName: Map<string, LayerProject>): LayerProject[] => {
    const chain: LayerProject[] = [];
    const visited = new Set<string>();
    let current: string | undefined = projectName;

    while (current && !visited.has(current)) {
        visited.add(current);
        const project = byName.get(current);
        if (!project) {
            break;
        }
        chain.unshift(project);
        current = getMainParent(project);
    }

    return chain;
};

const buildLevelMap = (all: LayerContent[]): Map<string, number> => {
    const byProject = new Map<string, LayerContent>();
    all.forEach(lc => byProject.set(lc.project.name, lc));

    const levels = new Map<string, number>();
    const compute = (item: LayerContent, visiting: Set<string>): number => {
        const name = item.project.name;
        const cached = levels.get(name);
        if (cached !== undefined) return cached;
        if (visiting.has(name)) return 0; // cycle guard
        visiting.add(name);

        let level = 0;
        for (const parentName of item.project.parents) {
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
    all.filter(lc => isChildOf(lc.project, parent.project.name));

const getRowKey = (item: LayerContent): string => `${item.project.name}:${item.item?.id ?? ''}`;

const unwrap = (root: LayerContent, all: LayerContent[], visited: Set<string>): LayerContent[] => {
    const name = root.project.name;
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
    const roots = all.filter(item => (levels.get(item.project.name) ?? 0) === 0);
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
    const projectsByName = new Map<string, LayerProject>(items.map(lc => [lc.project.name, lc.project]));
    const currentChainNames = new Set<string>(buildProjectsChain(activeProjectName, projectsByName).map(p => p.name));

    const isFromCurrentTree = (item: LayerContent): boolean => {
        const itemProjectName = item.project.name;
        if (currentChainNames.has(itemProjectName)) {
            return true;
        }
        return buildProjectsChain(itemProjectName, projectsByName).some(p => p.name === activeProjectName);
    };

    const levels = buildLevelMap(items);
    const ordered = flatten(items, levels);
    const visibleItems = ordered.filter(isFromCurrentTree);

    const toRow = (item: LayerContent): LayerRow => ({
        item,
        level: levels.get(item.project.name) ?? 0,
        isCurrent: item.project.name === activeProjectName,
        isInChain: currentChainNames.has(item.project.name),
        key: getRowKey(item),
    });

    return {
        all: ordered.map(toRow),
        visible: visibleItems.map(toRow),
    };
};
