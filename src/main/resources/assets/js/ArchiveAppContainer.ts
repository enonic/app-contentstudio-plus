import type {AppPanel} from '@enonic/lib-admin-ui/app/AppPanel';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ArchiveAppPanel} from './ArchiveAppPanel';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {fetchHasValidLicense} from './v6/features/api/license';
import {handleError} from './shared/errors';
import {NoLicenseBannerElement} from './v6/features/shared/license/NoLicenseBannerElement';
import {openNoLicenseDialog} from './v6/features/shared/license/NoLicenseDialog';
import {onValidLicenseLoaded} from './event/validLicenseLoaded';
import {mountArchiveDialogs} from './v6/features/shared/dialogs/archive/mountArchiveDialogs';

export class ArchiveAppContainer
    extends DivEl {

    private appPanel?: AppPanel;

    private noLicenseBanner?: NoLicenseBannerElement;

    private active: boolean = false;

    constructor() {
        super('app-container archive-app-container');

        // ! The host hides an inactive widget from outside and sends no event, so visibility is observed.
        const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
            this.setActive(entries[entries.length - 1].isIntersecting);
            if (!this.getHTMLElement().isConnected) {
                observer.disconnect();
            }
        });
        observer.observe(this.getHTMLElement());

        fetchHasValidLicense().then((isValid: boolean) => {
            this.handleValidationCheckResult(isValid);
        }).catch(handleError);
    }

    private setActive(active: boolean): void {
        if (this.active === active) {
            return;
        }

        this.active = active;
        Body.get().toggleClass('archive', active);

        if (active) {
            this.activateAppPanel();
        } else {
            this.appPanel?.unbindKeys();
        }
    }

    private activateAppPanel(): void {
        if (!this.appPanel) {
            return;
        }

        this.show();

        if (!this.appPanel.getPanelShown()) {
            this.appPanel.handleBrowse();
        }

        this.appPanel.bindKeys();
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

        const stopListening = onValidLicenseLoaded(() => {
            stopListening();
            this.handleValidLicenseLoaded();
        });

        openNoLicenseDialog();
    }

    private handleValidLicenseLoaded(): void {
        this.removeClass('no-license');
        this.noLicenseBanner?.remove();
        this.noLicenseBanner = undefined;

        const appPanel = new ArchiveAppPanel();
        this.appPanel = appPanel;

        this.whenRendered(() => {
            this.appendChild(appPanel);
            mountArchiveDialogs(this.getHTMLElement());
        });

        if (this.active) {
            this.activateAppPanel();
        }
    }

}
