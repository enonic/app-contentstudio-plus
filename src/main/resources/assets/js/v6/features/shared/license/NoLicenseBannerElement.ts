import {LegacyElement} from '../../../../shared/LegacyElement';
import {NoLicenseBanner, type NoLicenseBannerProps} from './NoLicenseBanner';

export class NoLicenseBannerElement extends LegacyElement<typeof NoLicenseBanner, NoLicenseBannerProps> {

    constructor(props: NoLicenseBannerProps = {}) {
        super(props, NoLicenseBanner);
    }
}
