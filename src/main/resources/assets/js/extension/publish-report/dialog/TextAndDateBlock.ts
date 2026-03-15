import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {Element} from '@enonic/lib-admin-ui/dom/Element';

export class TextAndDateBlock
    extends DivEl {

    private readonly iconEl: SpanEl;

    constructor(className: string = '') {
        super('text-and-date ' + className);

        this.appendChild(this.iconEl = new SpanEl('state-icon'));
        this.iconEl.hide();
    }

    setIconClass(value?: string): this {
        this.iconEl.setClass('state-icon ' + (value ? value : ''));
        this.iconEl.setVisible(!!value);

        return this;
    }

    addEntry(text: string, dateAsString: string): this {
        this.appendChildren(new SpanEl('text').setHtml(text), new SpanEl('date').setHtml(dateAsString));
        return this;
    }

    setEntry(text: string, dateAsString: string): this {
        this.getChildren().slice(0).forEach((child: Element) => {
            if (child !== this.iconEl) {
                child.remove();
            }
        });

        this.setIconClass();

        this.addEntry(text, dateAsString);
        return this;
    }
}
