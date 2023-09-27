import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import * as Q from 'q';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class SingleVersionPublishedTitle
    extends DivEl {

    private readonly partBeforeFirst: SpanEl;

    private readonly partFirstDate: SpanEl;

    constructor() {
        super('single-version-published-title');

        this.partBeforeFirst = new SpanEl('part-before-first').setHtml(i18n('widget.publish.report.date.range.compare.title.part1'));
        this.partFirstDate = new SpanEl('part-for-first-date');
    }

    setDate(value: string): void {
        this.partFirstDate.setHtml(value);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.appendChildren(this.partBeforeFirst, this.partFirstDate);

            return rendered;
        });
    }
}