import type {ResolvedTheme} from '@enonic/ui-types';
import {atom, onMount, type ReadableAtom} from 'nanostores';

export type HostTheme = ResolvedTheme;

const DARK_CLASS = 'dark';

const readHostTheme = (): HostTheme =>
    document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : 'light';

const $theme = atom<HostTheme>(readHostTheme());

onMount($theme, () => {
    $theme.set(readHostTheme());

    const observer = new MutationObserver(() => $theme.set(readHostTheme()));
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});

    return () => observer.disconnect();
});

export const $hostTheme: ReadableAtom<HostTheme> = $theme;

/** Mirrors the host theme onto an element, and onto its shadow host when it lives in a shadow root. */
export const syncTheme = (host: HTMLElement, theme: HostTheme): void => {
    const isDark = theme === 'dark';

    host.classList.toggle(DARK_CLASS, isDark);

    const root = host.getRootNode();
    if (root instanceof ShadowRoot) {
        root.host.classList.toggle(DARK_CLASS, isDark);
    }
};
