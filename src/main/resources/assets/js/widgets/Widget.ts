import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LoadMask} from 'lib-admin-ui/ui/mask/LoadMask';
import {AppHelper} from '../util/AppHelper';
import {OnOffButton} from 'lib-contentstudio/app/issue/view/OnOffButton';

export class Widget
    extends DivEl {

    private readonly loadMask: LoadMask;
    protected readonly contentId: string;
    protected readonly repository: string;
    private readonly button: OnOffButton;

    constructor(config: WidgetConfig, cls?: string) {
        super(AppHelper.getCommonWidgetClass() + (' ' + cls || ''));

        this.loadMask = new LoadMask(this);
        this.contentId = config.contentId;
        this.repository = config.repository;

        this.button = new OnOffButton({off: false, offLabel: 'Turn On', onLabel: 'Turn Off'});
        this.appendChild(this.button);
    }
}

export type WidgetConfig = {
    contentId: string,
    repository: string,
};
