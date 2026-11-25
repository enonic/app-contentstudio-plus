import {requestJson} from '@enonic/ui-utils/request';
import {getRestUrl} from './cms';

const displayNames = new Map<string, string>();
const unresolved = new Set<string>();

/** Display names of the principals by key; a key the server does not resolve is left out. */
export async function fetchPrincipalNames(keys: string[]): Promise<ReadonlyMap<string, string>> {
    const missing = [...new Set(keys)].filter((key) => !displayNames.has(key) && !unresolved.has(key));

    if (missing.length > 0) {
        const principals = await requestJson<{key: string; displayName: string}[]>(
            getRestUrl('security/principals/resolveByKeys'),
            {method: 'POST', body: {keys: missing, memberships: false}},
        ).match(
            (json) => json,
            (error) => {
                throw error;
            },
        );
        principals.forEach(({key, displayName}) => displayNames.set(key, displayName));
        missing.filter((key) => !displayNames.has(key)).forEach((key) => unresolved.add(key));
    }

    return displayNames;
}
