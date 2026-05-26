import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import {KeyRound} from 'lucide-react';
import {type ReactElement} from 'react';
import {LicenseUploadButton} from './LicenseUploadButton';

const NO_LICENSE_BANNER_NAME = 'NoLicenseBanner';

export type NoLicenseBannerProps = {
    variant?: 'compact' | 'full';
};

export const NoLicenseBanner = ({variant = 'compact'}: NoLicenseBannerProps): ReactElement => {
    const message = i18n('notify.archive.license.missing');

    if (variant === 'full') {
        return (
            <div
                data-component={NO_LICENSE_BANNER_NAME}
                className="flex h-full w-full flex-col items-center justify-center gap-6 p-8"
            >
                <KeyRound size={36} absoluteStrokeWidth className="text-main" />
                <p className="max-w-120 text-center text-base text-main">{message}</p>
                <LicenseUploadButton size="lg" />
            </div>
        );
    }

    return (
        <div
            data-component={NO_LICENSE_BANNER_NAME}
            className="flex flex-col items-center gap-4 rounded-md border border-bdr-subtle bg-surface-muted p-4 text-center"
        >
            <KeyRound size={20} absoluteStrokeWidth className="text-main" />
            <p className="text-base text-main">{message}</p>
            <LicenseUploadButton size="sm" variant="outline" />
        </div>
    );
};

NoLicenseBanner.displayName = NO_LICENSE_BANNER_NAME;

export class NoLicenseBannerElement extends LegacyElement<typeof NoLicenseBanner, NoLicenseBannerProps> {

    constructor(props: NoLicenseBannerProps = {}) {
        super(props, NoLicenseBanner);
    }
}
