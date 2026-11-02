import {pathName} from '../../../../shared/content/contentPath';
import type {VariantContent} from '../../../../shared/content/variantContent';

const VARIANT_PREFIX = 'variant-';

export const isVariantNameOccupied = (name: string, variants: VariantContent[]): boolean =>
    variants.some(v => pathName(v.path) === name);

export const getNextAvailableVariantName = (variants: VariantContent[]): string => {
    const occupied = new Set<number>([0]);
    variants.forEach(v => {
        const name = pathName(v.path);
        if (!name.startsWith(VARIANT_PREFIX)) return;
        const index = Number(name.slice(VARIANT_PREFIX.length));
        if (Number.isInteger(index) && index > 0) occupied.add(index);
    });
    const sorted = [...occupied].sort((a, b) => a - b);
    const firstGap = sorted.find((n, i) => n + 1 !== sorted[i + 1]);
    return `${VARIANT_PREFIX}${(firstGap ?? 0) + 1}`;
};
