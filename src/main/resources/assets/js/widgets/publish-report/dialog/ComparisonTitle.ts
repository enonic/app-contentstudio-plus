import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import * as Q from 'q';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class ComparisonTitle
    extends DivEl {

    private readonly partBeforeFirst: SpanEl;

    private readonly partFirstDate: SpanEl;

    private readonly partBetweenFirstAndSecond: SpanEl;

    private readonly partSecondDate: SpanEl;

    constructor() {
        super('comparison-title');

        this.partBeforeFirst = new SpanEl('part-before-first').setHtml(i18n('widget.publish.report.date.range.compare.title.part1'));
        this.partFirstDate = new SpanEl('part-for-first-date');
        this.partBetweenFirstAndSecond =
            new SpanEl('part-between-first-and-second').setHtml(i18n('widget.publish.report.date.range.compare.title.part2'));
        this.partSecondDate = new SpanEl('part-for-second-date');

    }

    setDates(firstDateString: string, secondDateString: string): void {
        this.partFirstDate.setHtml(firstDateString);
        this.partSecondDate.setHtml(secondDateString);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.partBeforeFirst, this.partFirstDate, this.partBetweenFirstAndSecond, this.partSecondDate);

            return rendered;
        });
    }
}