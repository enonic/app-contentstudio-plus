// Shim for the XP 8 `publicRead: boolean` field on `Project`, which replaces the
// XP 7 nested `readAccess` shape (enonic/xp#12043). Drop once @enonic-types/lib-project
// publishes a release that carries the new field.
declare module '@enonic-types/lib-project' {
    interface Project<Config extends Record<string, unknown> = Record<string, unknown>> {
        publicRead: boolean;
    }
}

export {};
