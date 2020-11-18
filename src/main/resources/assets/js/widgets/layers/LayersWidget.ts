import {WidgetConfig, Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';

export class LayersWidget
    extends Widget {

    constructor(config: WidgetConfig) {
        super(config, AppHelper.getLayersWidgetClass());
    }
}
