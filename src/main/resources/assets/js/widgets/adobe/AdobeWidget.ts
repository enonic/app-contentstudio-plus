import {Widget} from '../Widget';
import {AppHelper} from '../../util/AppHelper';
import * as Q from 'q';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {Button} from '@enonic/lib-admin-ui/ui/button/Button';
import {ContentUploadDialog} from './dialog/ContentUploadDialog';
import {ActivityList} from './ui/list/ActivityList';
import {ActivityStatus, ActivityType} from './ui/list/Activity';

export class AdobeWidget
    extends Widget {

    private static INSTANCE: AdobeWidget;

    private uploadButton?: Button;

    constructor() {
        super(AppHelper.getAdobeWidgetClass());
    }

    static get(): AdobeWidget {
        if (!AdobeWidget.INSTANCE) {
            AdobeWidget.INSTANCE = new AdobeWidget();
        }

        return AdobeWidget.INSTANCE;
    }

    setContentId(contentId: string): void {
        super.setContentId(contentId);

        if (!this.contentId) {
            this.handleNoSelectedItem();
            return;
        }

        this.loadDataAndUpdateWidgetContent();
    }

    private loadDataAndUpdateWidgetContent(): void {
        this.fetchData().then(() => {
            this.showUploadButton();
            this.displayActivities();
            return Q.resolve();
        }).catch((e: Error) => {
            DefaultErrorHandler.handle(e);
            this.handleError();
        }).finally(() => this.loadMask.hide());
    }

    private fetchData(): Q.Promise<void> {
        this.loadMask.show();
        setTimeout(() => this.loadMask.hide(), 500);

        return Q.resolve();
    }

    private displayActivities(): void {
        this.appendChild(
            new ActivityList([{
                displayName: 'PS pg 3 headline cust id sync check',
                description: 'http://sb.com/plain_site/page_three.html',
                type: ActivityType.XT,
                status: ActivityStatus.ACTIVE,
            }, {
                displayName: 'Macys HP 101 override',
                description: 'https://www.macys.com',
                type: ActivityType.XT,
            }, {
                displayName: 'Macys HP re-sort AT',
                description: 'https://www.macys.com',
                type: ActivityType.AB,
                status: ActivityStatus.ACTIVE,
            }, {
                displayName: 'Global terms link temporary fix',
                type: ActivityType.XT,
                status: ActivityStatus.PAUSED,
            }]),
        );
    }

    private showUploadButton(): void {
        if (!this.uploadButton) {
            this.uploadButton = this.initUploadButton();
            this.appendChild(this.uploadButton);
        }

        this.uploadButton.show();
    }

    private initUploadButton(): Button {
        const button: Button = new Button('Upload to Target...');
        button.addClass('widget-adobe-button-upload');

        button.onClicked(() => {
           ContentUploadDialog.get().open();
        });

        return button;
    }

    private handleError(): void {
        //
    }
}
