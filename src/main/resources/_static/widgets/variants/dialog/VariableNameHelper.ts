import {NumberHelper} from '@enonic/lib-admin-ui/util/NumberHelper';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';

export class VariableNameHelper {

    private static PREFIX: string = 'variant-';

    private variants: ContentSummaryAndCompareStatus[];

    constructor(variants?: ContentSummaryAndCompareStatus[]) {
        this.variants = variants || [];
    }

    getNextAvailableName(): string {
        const occupiedNumbers: number[] = this.extractOccupiedNumbers();
        const cleanedAndSorted: number[] = occupiedNumbers
            .sort()
            .filter((n: number, i: number) => n !== occupiedNumbers[i + 1]);

        const lastOccupiedItem: number = cleanedAndSorted.find((n: number, i: number) => (n + 1) !== cleanedAndSorted[i + 1]);

        return `variant-${lastOccupiedItem + 1}`;
    }

    private extractOccupiedNumbers(): number[] {
        const occupiedNumbers: number[] = [0];

        this.variants.forEach((variant: ContentSummaryAndCompareStatus) => {
            const extractedPostfixIndex: number = this.extractPostfixIndexNumber(variant);

            if (extractedPostfixIndex) {
                occupiedNumbers.push(extractedPostfixIndex);
            }
        });

        return occupiedNumbers;
    }

    private extractPostfixIndexNumber(variant: ContentSummaryAndCompareStatus): number {
        const path: string = variant.getPath().getName();

        if (path.startsWith(VariableNameHelper.PREFIX)) {
            const indexAfterPrefix: number = NumberHelper.toNumber(path.replace(VariableNameHelper.PREFIX, ''));

            if (indexAfterPrefix && indexAfterPrefix > 0) {
                return indexAfterPrefix;
            }
        }

        return null;
    }
}