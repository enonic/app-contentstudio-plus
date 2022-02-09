import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LoadMask} from 'lib-admin-ui/ui/mask/LoadMask';
import {AppHelper} from '../util/AppHelper';
import {OnOffButton} from 'lib-contentstudio/app/issue/view/OnOffButton';

export class Widget
    extends DivEl {

    protected readonly contentId: string;
    private readonly loadMask: LoadMask;
    private readonly button: OnOffButton;

    constructor(contentId: string, cls?: string) {
        super(AppHelper.getCommonWidgetClass() + (' ' + cls || ''));

        this.loadMask = new LoadMask(this);
        this.contentId = contentId;

        this.button = new OnOffButton({off: false, offLabel: 'Turn On', onLabel: 'Turn Off'});
        this.appendChild(this.button);
    }
}
