import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';

export class TextAndDateBlock
    extends DivEl {

    constructor(className: string = '') {
        super('text-and-date ' + className);
    }

    addEntry(text: string, dateAsString: string): this {
        this.appendChildren(new SpanEl('text').setHtml(text), new SpanEl('date').setHtml(dateAsString));
        return this;
    }

    setEntry(text: string, dateAsString: string): this {
        this.removeChildren();
        this.addEntry(text, dateAsString);
        return this;
    }
}
