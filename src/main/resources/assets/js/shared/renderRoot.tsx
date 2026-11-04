import {I18nProvider, IdProvider} from '@enonic/ui';
import type {ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {translate} from './i18n';

type Root = ReturnType<typeof createRoot>;

export function renderRoot(host: HTMLElement, idPrefix: string, children: ReactNode): Root {
    const root = createRoot(host);
    root.render(
        <I18nProvider translate={translate}>
            <IdProvider prefix={idPrefix}>{children}</IdProvider>
        </I18nProvider>,
    );
    return root;
}
