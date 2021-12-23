import {App} from 'lib-contentstudio/app/App';
import {AppContainer} from 'lib-contentstudio/app/AppContainer';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ArchiveAppContainer} from './ArchiveAppContainer';
import {DescriptorKey} from 'lib-contentstudio/app/page/DescriptorKey';

export class ArchiveApp
    extends App {

    constructor() {
        super(DescriptorKey.fromString(`${CONFIG.appId}.plus:main`));
    }

    getIconClass(): string {
        return 'icon-archive';
    }

    getDisplayName(): string {
        return i18n('app.archive');
    }

    protected createAppContainer(): AppContainer {
        return new ArchiveAppContainer();
    }

    getUrlPath(): string {
        return 'archive';
    }
}
