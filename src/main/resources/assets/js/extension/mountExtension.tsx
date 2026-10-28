import {IdProvider} from '@enonic/ui';
import {useEffect, useState, type ReactElement, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {handleError} from '../shared/errors';
import {useI18n} from '../shared/i18n';
import {AppHelper} from '../util/AppHelper';
import {NoLicenseBanner} from '../v6/features/shared/license/NoLicenseBanner';
import {fetchHasValidLicense} from '../v6/features/api/license';
import {ExtensionRoot} from './ExtensionRoot';
import {$hostTheme, type HostTheme} from './hostTheme';

const DARK_CLASS = 'dark';

type ExtensionContentProps = {
    contentId: string | null;
    children: ReactNode;
};

const ExtensionContent = ({contentId, children}: ExtensionContentProps): ReactElement | null => {
    const [licensed, setLicensed] = useState<boolean>();
    const emptyMessage = useI18n('field.contextPanel.empty');

    useEffect(() => {
        fetchHasValidLicense().then(setLicensed).catch(handleError);
    }, []);

    if (licensed == null) {
        return null;
    }
    if (!licensed) {
        return <NoLicenseBanner />;
    }
    if (!contentId) {
        return <span className="error">{emptyMessage}</span>;
    }
    return <>{children}</>;
};

ExtensionContent.displayName = 'ExtensionContent';

const syncTheme = (host: HTMLElement, theme: HostTheme): void => {
    const isDark = theme === 'dark';

    host.classList.toggle(DARK_CLASS, isDark);

    const root = host.getRootNode();
    if (root instanceof ShadowRoot) {
        root.host.classList.toggle(DARK_CLASS, isDark);
    }
};

export type MountExtensionOptions = {
    className: string;
    idPrefix: string;
    contentId: string | null;
    children: ReactNode;
};

export function mountExtension({className, idPrefix, contentId, children}: MountExtensionOptions): void {
    const container = document.querySelector(`.${AppHelper.getCommonExtensionContainerClass()}`);
    if (!container) {
        throw Error('Missing extension container');
    }

    const host = document.createElement('div');
    host.className = `${AppHelper.getCommonExtensionClass()} ${className}`;
    container.appendChild(host);

    $hostTheme.subscribe((theme) => syncTheme(host, theme));

    createRoot(host).render(
        <ExtensionRoot>
            <IdProvider prefix={idPrefix}>
                <ExtensionContent contentId={contentId}>{children}</ExtensionContent>
            </IdProvider>
        </ExtensionRoot>,
    );
}
