import {postArchive} from './archive';

const displayNames = new Map<string, string>();
const unresolved = new Set<string>();

/** Display names of the principals by key; a key the server does not resolve is left out. */
export async function fetchPrincipalNames(keys: string[]): Promise<ReadonlyMap<string, string>> {
    const missing = [...new Set(keys)].filter((key) => !displayNames.has(key) && !unresolved.has(key));

    if (missing.length > 0) {
        const {names} = await postArchive<{names: Record<string, string>}>('principals', {keys: missing});
        Object.entries(names).forEach(([key, displayName]) => displayNames.set(key, displayName));
        missing.filter((key) => !displayNames.has(key)).forEach((key) => unresolved.add(key));
    }

    return displayNames;
}
