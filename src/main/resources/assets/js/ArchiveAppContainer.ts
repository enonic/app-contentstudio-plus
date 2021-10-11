import {AppContainer} from 'lib-contentstudio/app/AppContainer';
import {Application} from 'lib-admin-ui/app/Application';
import {AppBar} from 'lib-admin-ui/app/bar/AppBar';
import {AppPanel} from 'lib-admin-ui/app/AppPanel';
import {ArchiveAppBar} from './ArchiveAppBar';
import {ArchiveAppPanel} from './ArchiveAppPanel';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';

export class ArchiveAppContainer
    extends AppContainer {

    constructor() {
        super();

        this.onShown(() => {
            history.pushState(null, null, `main#/${ProjectContext.get().getProject().getName()}/${ArchiveResourceRequest.ARCHIVE_PATH}`);
        });
    }

    protected createAppBar(application: Application): AppBar {
        return new ArchiveAppBar(application);
    }

    protected createAppPanel(): AppPanel {
        return new ArchiveAppPanel();
    }

}
