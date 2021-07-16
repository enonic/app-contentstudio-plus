import {AppContainer} from "lib-contentstudio/app/AppContainer";
import {Application} from 'lib-admin-ui/app/Application';
import {AppBar} from "lib-admin-ui/app/bar/AppBar";
import {AppPanel} from "lib-admin-ui/app/AppPanel";
import {ArchiveAppBar} from './ArchiveAppBar';
import {ArchiveAppPanel} from './ArchiveAppPanel';

export class ArchiveAppContainer extends AppContainer {

    protected createAppBar(application: Application): AppBar {
        return new ArchiveAppBar(application);
    }

    protected createAppPanel(): AppPanel {
        return new ArchiveAppPanel();
    }

}