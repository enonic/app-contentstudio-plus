import {AppRoot, I18nProvider} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement, ReactNode} from 'react';
import {translate} from '../shared/i18n';
import {$hostTheme} from './hostTheme';

export type ExtensionRootProps = {
    children: ReactNode;
};

export const ExtensionRoot = ({children}: ExtensionRootProps): ReactElement => {
    const theme = useStore($hostTheme);

    return (
        <I18nProvider translate={translate}>
            <AppRoot theme={theme} className="contents">
                {children}
            </AppRoot>
        </I18nProvider>
    );
};

ExtensionRoot.displayName = 'ExtensionRoot';
