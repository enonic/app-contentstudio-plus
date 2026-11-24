import {handleError} from '../../../../shared/errors';
import {fetchArchivedByIds} from '../../api/archive';
import {searchArchive} from '../../api/archive-search';
import type {ArchivedContent, ArchivedPage} from '../../shared/content/archivedContent';
import {setArchiveFilter} from '../archive-list';
import {$archiveSearch, $archiveSearchFacets, $isArchiveSearchActive, type ArchiveSearch} from './archive-search.store';

const PAGE_SIZE = 10;

const SEARCH_DELAY_MS = 300;

let searchTimer: ReturnType<typeof setTimeout> | undefined;
let lastFacetsRequest = 0;

const toParams = ({text, selection}: ArchiveSearch): ArchiveSearch => ({text: text.trim(), selection});

async function loadFoundPage(search: ArchiveSearch): Promise<ArchivedPage> {
    const {ids, total} = await searchArchive({...search, count: PAGE_SIZE, aggregations: false});
    const found = new Map((await fetchArchivedByIds(ids)).map((item) => [item.id, item]));

    return {
        items: ids.map((id) => found.get(id)).filter((item): item is ArchivedContent => !!item),
        total,
    };
}

/** Counts the hits and the buckets of the current search again, leaving the list as it is. */
export async function refreshArchiveSearchFacets(): Promise<void> {
    const request = ++lastFacetsRequest;

    try {
        const {total, aggregations} = await searchArchive({...toParams($archiveSearch.get()), count: 0, aggregations: true});

        if (request === lastFacetsRequest) {
            $archiveSearchFacets.set({total, aggregations});
        }
    } catch (error) {
        if (request === lastFacetsRequest) {
            handleError(error);
        }
    }
}

async function applyArchiveSearch(): Promise<void> {
    const search = toParams($archiveSearch.get());
    const filter = $isArchiveSearchActive.get() ? () => loadFoundPage(search) : null;

    await Promise.all([refreshArchiveSearchFacets(), setArchiveFilter(filter)]);
}

function scheduleArchiveSearch(): void {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void applyArchiveSearch(), SEARCH_DELAY_MS);
}

export function setArchiveSearchText(text: string): void {
    $archiveSearch.setKey('text', text);
    scheduleArchiveSearch();
}

export function setArchiveSearchSelection(name: string, keys: string[]): void {
    $archiveSearch.setKey('selection', {...$archiveSearch.get().selection, [name]: keys});
    scheduleArchiveSearch();
}

/** Clears the search and brings the tree back. */
export function resetArchiveSearch(): Promise<void> {
    clearTimeout(searchTimer);
    $archiveSearch.set({text: '', selection: {}});

    return applyArchiveSearch();
}
