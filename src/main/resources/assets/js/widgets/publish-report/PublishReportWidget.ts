import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {PublishReportDialog} from './dialog/PublishReportDialog';

export class PublishReportWidget
    extends Widget {

    private static INSTANCE: PublishReportWidget;

    constructor() {
        super(AppHelper.getPublishReportWidgetClass());
    }

    static get(): PublishReportWidget {
        if (!PublishReportWidget.INSTANCE) {
            PublishReportWidget.INSTANCE = new PublishReportWidget();
        }

        return PublishReportWidget.INSTANCE;
    }

    setContentId(contentId: string): void {
        super.setContentId(contentId);

        this.appendChild(this.initDialogButton());
    }

    private initDialogButton(): Button {
        const button: Button = new Button(i18n('widget.publish.report.button.text'));
        button.addClass('publish-report-widget-button-open');

        button.onClicked(() => {
            PublishReportDialog.get().setContentId(this.contentId).open();
        });

        return button;
    }
}
