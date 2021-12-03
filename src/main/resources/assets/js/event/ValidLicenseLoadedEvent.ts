import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class ValidLicenseLoadedEvent extends Event {

    static on(handler: (event: ValidLicenseLoadedEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: ValidLicenseLoadedEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
