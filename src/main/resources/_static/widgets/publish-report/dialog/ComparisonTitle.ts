import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import Q from 'q';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ComparisonMode} from './ComparisonMode';

export class ComparisonTitle
    extends DivEl {

    private readonly partBeforeFirst: SpanEl;

    private readonly partFirstDate: SpanEl;

    private readonly partBetweenFirstAndSecond?: SpanEl;

    private readonly partSecondDate?: SpanEl;

    private readonly mode: ComparisonMode;

    constructor(mode?: ComparisonMode) {
        super('comparison-title');

        this.mode = mode ?? ComparisonMode.COMPARE;

        const partBeforeFirst = this.isCompareMode() ? i18n('widget.publishReport.dateRange.compare.title.part1') : i18n('status.published');
        this.partBeforeFirst = new SpanEl('part-before-first').setHtml(partBeforeFirst);
        this.partFirstDate = new SpanEl('part-for-first-date');

        if (this.isCompareMode()) {
            this.partBetweenFirstAndSecond =
                new SpanEl('part-between-first-and-second').setHtml(i18n('widget.publishReport.dateRange.compare.title.part2'));
            this.partSecondDate = new SpanEl('part-for-second-date');
        }
    }

    setDates(firstDateString: string, secondDateString?: string): void {
        if (this.isCompareMode()) {
            this.partFirstDate.setHtml(secondDateString);
            this.partSecondDate.setHtml(firstDateString);
        } else {
            this.partFirstDate.setHtml(firstDateString);
        }
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.partBeforeFirst, this.partFirstDate);

            if (this.isCompareMode()) {
                this.appendChildren(this.partBetweenFirstAndSecond, this.partSecondDate);
            }

            return rendered;
        });
    }

    private isCompareMode(): boolean {
        return this.mode === ComparisonMode.COMPARE;
    }
}
