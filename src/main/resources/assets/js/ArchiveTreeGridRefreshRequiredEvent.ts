import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class ArchiveTreeGridRefreshRequiredEvent
    extends Event {

    static on(handler: (event: ArchiveTreeGridRefreshRequiredEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: ArchiveTreeGridRefreshRequiredEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
