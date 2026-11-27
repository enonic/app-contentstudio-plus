import type {ArchivedContentJson} from '../../../resource/json/ArchivedContentJson';
import {type ArchivedContent, toArchivedContent} from '../shared/content/archivedContent';
import {postArchive} from './archive';

export type ArchiveBucket = {
    key: string;
    docCount: number;
    displayName?: string;
};

export type ArchiveAggregation = {
    name: string;
    buckets: ArchiveBucket[];
};

export type ArchiveSearchParams = {
    text: string;
    selection: Record<string, string[]>;
    /** How many of the found items to return. */
    count: number;
    /** Whether to count the buckets of the filter sections. */
    aggregations: boolean;
};

export type ArchiveSearchResult = {
    items: ArchivedContent[];
    total: number;
    aggregations: ArchiveAggregation[];
};

type ArchiveSearchJson = Omit<ArchiveSearchResult, 'items'> & {items: ArchivedContentJson[]};

/** Searches the archive of the active project. */
export async function searchArchive(params: ArchiveSearchParams): Promise<ArchiveSearchResult> {
    const json = await postArchive<ArchiveSearchJson>('search', params);

    return {...json, items: json.items.map(toArchivedContent)};
}
