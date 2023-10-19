import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

export class ValidLicenseLoadedEvent extends Event {

    static on(handler: (event: ValidLicenseLoadedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: ValidLicenseLoadedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
