import {AppContainer} from '@enonic/lib-contentstudio/app/AppContainer';
import {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {ArchiveAppPanel} from './ArchiveAppPanel';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {fetchHasValidLicense} from './v6/features/api/license';
import {handleError} from './shared/errors';
import {NoLicenseBannerElement} from './v6/features/shared/license/NoLicenseBannerElement';
import {openNoLicenseDialog} from './v6/features/shared/license/NoLicenseDialog';
import {ValidLicenseLoadedEvent} from './event/ValidLicenseLoadedEvent';
import {mountArchiveDialogs} from './v6/features/shared/dialogs/archive/mountArchiveDialogs';

export class ArchiveAppContainer
    extends AppContainer {

    private noLicenseBanner?: NoLicenseBannerElement;

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
        fetchHasValidLicense().then((isValid: boolean) => {
            this.handleValidationCheckResult(isValid);
        }).catch(handleError);
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
        this.noLicenseBanner = new NoLicenseBannerElement({variant: 'full'});
        this.appendChild(this.noLicenseBanner);

        const handler = (): void => {
            ValidLicenseLoadedEvent.un(handler);
            this.handleValidLicenseLoaded();
        };
        ValidLicenseLoadedEvent.on(handler);

        openNoLicenseDialog();
    }

    private handleValidLicenseLoaded(): void {
        this.removeClass('no-license');
        this.noLicenseBanner?.remove();
        this.noLicenseBanner = undefined;
        super.initElements();

        this.whenRendered(() => {
            super.appendElements();
            mountArchiveDialogs(this.getHTMLElement());
        });

        this.show();
    }

}
