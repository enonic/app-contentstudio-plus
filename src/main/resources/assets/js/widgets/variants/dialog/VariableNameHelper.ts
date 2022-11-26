import {NumberHelper} from '@enonic/lib-admin-ui/util/NumberHelper';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';

export class VariableNameHelper {

    private static PREFIX: string = 'variant-';

    private variants: ContentSummary[];

    constructor(variants?: ContentSummary[]) {
        this.variants = variants || [];
    }

    getNextAvailableName(): string {
        let nextAvailableIndex: number = this.variants.length;

        this.variants.forEach((variant: ContentSummary) => {
            const path: string = variant.getPath().getName();

            if (path.startsWith(VariableNameHelper.PREFIX)) {
                const partAfterPrefix: number = NumberHelper.toNumber(path.replace(VariableNameHelper.PREFIX, ''));

                if (partAfterPrefix && partAfterPrefix > 0 && partAfterPrefix < nextAvailableIndex) {
                    nextAvailableIndex = partAfterPrefix;
                }
            }
        });

        return `variant-${nextAvailableIndex + 1}`;
    }
}