import {NumberHelper} from '@enonic/lib-admin-ui/util/NumberHelper';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

const VARIANT_PREFIX = 'variant-';

export const isVariantNameOccupied = (name: string, variants: ContentSummaryAndCompareStatus[]): boolean =>
    variants.some(v => v.getPath().getName() === name);

export const getNextAvailableVariantName = (variants: ContentSummaryAndCompareStatus[]): string => {
    const occupied = new Set<number>([0]);
    variants.forEach(v => {
        const name = v.getPath().getName();
        if (!name.startsWith(VARIANT_PREFIX)) return;
        const index = NumberHelper.toNumber(name.slice(VARIANT_PREFIX.length));
        if (index && index > 0) occupied.add(index);
    });

    const sorted = [...occupied].sort((a, b) => a - b);
    const firstGap = sorted.find((n, i) => n + 1 !== sorted[i + 1]);
    return `${VARIANT_PREFIX}${(firstGap ?? 0) + 1}`;
};
