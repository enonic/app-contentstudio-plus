import {atom, onMount, type ReadableAtom} from 'nanostores';

export type HostTheme = 'light' | 'dark';

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
