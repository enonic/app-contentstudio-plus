import {atom, computed, map} from 'nanostores';
import type {ArchiveAggregation} from '../../api/archive-search';

export type ArchiveSearch = {
    text: string;
    selection: Record<string, string[]>;
};

export type ArchiveSearchFacets = {
    total: number;
    aggregations: ArchiveAggregation[];
};

export const $archiveSearch = map<ArchiveSearch>({text: '', selection: {}});

export const $archiveSearchFacets = atom<ArchiveSearchFacets>({total: 0, aggregations: []});

export const $isArchiveSearchActive = computed(
    $archiveSearch,
    ({text, selection}) => text.trim().length > 0 || Object.values(selection).some((keys) => keys.length > 0),
);
