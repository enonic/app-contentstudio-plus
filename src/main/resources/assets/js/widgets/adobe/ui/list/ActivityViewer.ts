import {Activity, ActivityStatus, ActivityType} from './Activity';
import {NamesAndIconViewer} from '@enonic/lib-admin-ui/ui/NamesAndIconViewer';

export class ActivityViewer
    extends NamesAndIconViewer<Activity> {

    setObject(object: Activity): void {
        super.setObject(object);

        this.addClass(this.getStatusClass());
    }

    resolveDisplayName(object: Activity): string {
        return object.getDisplayName();
    }

    resolveSubName(object: Activity): string {
        return object.getDescription();
    }

    resolveIconClass(object: Activity): string {
        let typeCls = 'type';
        switch (object.getType()) {
            case ActivityType.XT:
                typeCls += '-xt';
                break;
            case ActivityType.AB:
                typeCls += '-ab';
                break;
        }

        return typeCls;
    }

    private getStatusClass(): string {
        let statusCls = 'status';
        switch (this.getObject().getStatus()) {
            case ActivityStatus.ACTIVE:
                statusCls += '-active';
                break;
            case ActivityStatus.INACTIVE:
                statusCls += '-inactive';
                break;
            case ActivityStatus.PAUSED:
                statusCls += '-paused';
                break;
        }

        return statusCls;
    }

}
