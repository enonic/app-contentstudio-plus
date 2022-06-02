import {AppContainer} from 'lib-contentstudio/app/AppContainer';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {AppBar} from '@enonic/lib-admin-ui/app/bar/AppBar';
import {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {ArchiveAppBar} from './ArchiveAppBar';
import {ArchiveAppPanel} from './ArchiveAppPanel';
import {ProjectContext} from 'lib-contentstudio/app/project/ProjectContext';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {HasValidLicenseRequest} from './resource/HasValidLicenseRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ArchiveNoLicenseDialog} from './ArchiveNoLicenseDialog';
import {ArchiveNoLicenseBlock} from './ArchiveNoLicenseBlock';
import {ValidLicenseLoadedEvent} from './event/ValidLicenseLoadedEvent';

export class ArchiveAppContainer
    extends AppContainer {

    constructor() {
        super('archive-app-container');

        this.onShown(() => {
            Body.get().addClass('archive');
        });

        this.onHidden(() => {
            Body.get().removeClass('archive');
        });
    }

    protected initElements(): void {
        new HasValidLicenseRequest().sendAndParse().then((isValid: boolean) => {
            this.handleValidationCheckResult(isValid);
        }).catch(DefaultErrorHandler.handle);
    }

    protected appendElements(): void {
        //
    }

    protected createAppBar(application: Application): AppBar {
        return new ArchiveAppBar(application);
    }

    protected createAppPanel(): AppPanel {
        return new ArchiveAppPanel();
    }

    private handleValidationCheckResult(isValid: boolean): void {
        if (isValid) {
            this.handleValidLicenseLoaded();
        } else {
            this.addClass('no-license');
            this.renderNoLicense();
        }
    }

    private renderNoLicense(): void {
        this.appendChild(new ArchiveNoLicenseBlock());

        ValidLicenseLoadedEvent.on(() => {
            this.handleValidLicenseLoaded();
        });

        new ArchiveNoLicenseDialog().open();
    }

    private handleValidLicenseLoaded(): void {
        this.removeClass('no-license');
        super.initElements();

        this.whenRendered(() => {
            super.appendElements();
        });

        this.show();
    }

}
