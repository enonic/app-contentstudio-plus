import {H6El} from '@enonic/lib-admin-ui/dom/H6El';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {AEl} from '@enonic/lib-admin-ui/dom/AEl';
import {ActivityBuilder, ActivityJson} from './Activity';
import {ActivityViewer} from './ActivityViewer';

export class ActivityList
    extends DivEl {

    constructor(activitiesJson: ActivityJson[]) {
        super('adobe-activity-list');

        this.appendHeader();
        this.appendActivityList(activitiesJson);
    }

    private appendHeader(): void {
        const headerEl = new H6El('adobe-activity-list-header')
                        .setHtml('Activities');
        const linkEl = new AEl('adobe-activity-list-header-link icon-new-tab')
                        .setUrl('https://experiencecloud.adobe.com/', '_blank')
                        .setHtml('Open Adobe Target');

        headerEl.appendChild(linkEl);
        this.appendChild(headerEl);
    }

    private appendActivityList(activitiesJson: ActivityJson[]): void {
        activitiesJson.forEach(activityJson => {
           const activity = new ActivityBuilder().fromJson(activityJson).build();
           const viewer = new ActivityViewer('adobe-activity-list-item');
           viewer.setObject(activity);
           this.appendChild(viewer);
        });
    }

}
