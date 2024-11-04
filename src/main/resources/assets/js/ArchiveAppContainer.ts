import {AppContainer} from 'lib-contentstudio/app/AppContainer';
import {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {ArchiveAppPanel} from './ArchiveAppPanel';
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
