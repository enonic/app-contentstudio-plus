import {AppRoot} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement, ReactNode} from 'react';
import {$hostTheme} from './hostTheme';

export type ExtensionRootProps = {
    children: ReactNode;
};

export const ExtensionRoot = ({children}: ExtensionRootProps): ReactElement => {
    const theme = useStore($hostTheme);

    return (
        <AppRoot theme={theme} className="contents">
            {children}
        </AppRoot>
    );
};

ExtensionRoot.displayName = 'ExtensionRoot';
