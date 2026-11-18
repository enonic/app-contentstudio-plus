// ! This entry must do nothing but load the app chunk. The page loads it with a `?v=` query,
// ! while chunks import shared code from it (Vite's preload helper at least) by its bare URL,
// ! so the browser evaluates it twice. Anything else placed here would run twice as well.
void import('./archiveApp');
