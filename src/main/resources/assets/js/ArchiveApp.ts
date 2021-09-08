import {App} from 'lib-contentstudio/app/App';
import {AppContainer} from 'lib-contentstudio/app/AppContainer';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ArchiveAppContainer} from './ArchiveAppContainer';

export class ArchiveApp
    extends App {

    constructor() {
        super('plus');
    }

    protected createAppContainer(): AppContainer {
        return new ArchiveAppContainer();
    }

    getIconClass(): string {
        return 'icon-archive';
    }

    getDisplayName(): string {
        return i18n('app.archive');
    }
}
