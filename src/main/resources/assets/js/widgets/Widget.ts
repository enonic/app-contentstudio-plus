import {DivEl} from 'lib-admin-ui/dom/DivEl';
import {LoadMask} from 'lib-admin-ui/ui/mask/LoadMask';
import {AppHelper} from '../util/AppHelper';

export class Widget
    extends DivEl {

    private readonly loadMask: LoadMask;
    private readonly contentId: string;
    private readonly repository: string;

    constructor(config: WidgetConfig, cls?: string) {
        super(AppHelper.getCommonWidgetClass() + (' ' + cls || ''));

        this.loadMask = new LoadMask(this);
        this.contentId = config.contentId;
        this.repository = config.repository;
    }
}

export type WidgetConfig = {
    contentId: string,
    repository: string,
};
