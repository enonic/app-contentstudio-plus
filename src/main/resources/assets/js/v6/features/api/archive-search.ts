import {requestJson} from '@enonic/ui-utils/request';
import {$config} from '../../../shared/config';
import {getActiveProjectName} from '../../../shared/project';

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
    /** How many of the found ids to return. */
    count: number;
    /** Whether to count the buckets of the filter sections. */
    aggregations: boolean;
};

export type ArchiveSearchResult = {
    ids: string[];
    total: number;
    aggregations: ArchiveAggregation[];
};

/** Searches the archive of the active project. */
export function searchArchive(params: ArchiveSearchParams): Promise<ArchiveSearchResult> {
    return requestJson<ArchiveSearchResult>($config.get().services.archiveUrl, {
        method: 'POST',
        body: {project: getActiveProjectName(), ...params},
    }).match(
        (json) => json,
        (error) => {
            throw error;
        },
    );
}
