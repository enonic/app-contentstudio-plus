import {LegacyElement as BaseLegacyElement} from '@enonic/lib-admin-ui/ui2/LegacyElement';
import {I18nProvider, IdProvider} from '@enonic/ui';
import type {ComponentType} from 'react';
import {render} from 'react-dom';
import {translate} from './i18n';

// Not compat's ComponentProps: restating it on a subclass blows up under preact 11 (TS2589).
type PropsOf<C> = C extends ComponentType<infer P> ? P : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class LegacyElement<C extends ComponentType<any>, P extends PropsOf<C> = PropsOf<C>> extends BaseLegacyElement<C, P> {
    protected renderJsx(): void {
        const Component = this.component;

        render(
            <I18nProvider translate={translate}>
                <IdProvider prefix={this.getPrefix()}>
                    <Component {...this.props.get()} />
                </IdProvider>
            </I18nProvider>,
            this.getHTMLElement(),
        );
    }
}
