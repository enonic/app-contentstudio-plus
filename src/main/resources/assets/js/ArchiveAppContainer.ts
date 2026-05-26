import {AppContainer} from '@enonic/lib-contentstudio/app/AppContainer';
import {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {ArchiveAppPanel} from './ArchiveAppPanel';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {HasValidLicenseRequest} from './resource/HasValidLicenseRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {NoLicenseBannerElement} from './v6/features/shared/license/NoLicenseBanner';
import {NoLicenseDialogElement} from './v6/features/shared/license/NoLicenseDialog';
import {ValidLicenseLoadedEvent} from './event/ValidLicenseLoadedEvent';
import {ArchiveDeleteDialogElement} from './v6/features/shared/dialogs/archive/ArchiveDeleteDialog';
import {ArchiveRestoreDialogElement} from './v6/features/shared/dialogs/archive/ArchiveRestoreDialog';
import {ArchiveCompareVersionsDialogElement} from './v6/features/views/context/widget/versions/ArchiveCompareVersionsDialog';

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
        this.appendChild(new NoLicenseBannerElement({variant: 'full'}));

        ValidLicenseLoadedEvent.on(() => {
            this.handleValidLicenseLoaded();
        });

        new NoLicenseDialogElement().open();
    }

    private handleValidLicenseLoaded(): void {
        this.removeClass('no-license');
        super.initElements();

        this.whenRendered(() => {
            super.appendElements();
            this.appendChild(new ArchiveDeleteDialogElement());
            this.appendChild(new ArchiveRestoreDialogElement());
            this.appendChild(new ArchiveCompareVersionsDialogElement());
        });

        this.show();
    }

}
