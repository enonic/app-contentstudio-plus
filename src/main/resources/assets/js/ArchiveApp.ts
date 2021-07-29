import {App} from 'lib-contentstudio/app/App';
import {AppContainer} from 'lib-contentstudio/app/AppContainer';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ArchiveAppContainer} from './ArchiveAppContainer';

export class ArchiveApp
    extends App {

    constructor() {
        super('main');
    }

    protected createAppContainer(): AppContainer {
        return new ArchiveAppContainer();
    }

    getIconName(): string {
        return i18n('app.archive');
    }

    generateAppUrl(): string {
        return 'main';
    }
}
