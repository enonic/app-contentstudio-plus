import {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import type {ContentSummaryJson} from '@enonic/lib-contentstudio/app/content/ContentSummaryJson';
import {requestJson} from '@enonic/ui-utils/request';
import {ARCHIVE_ROOT, getCmsRestUrl, withParams} from './cms';

export type ArchivedPage = {
    items: ContentSummaryAndCompareStatus[];
    total: number;
};

type ContentListJson = {
    contents: ContentSummaryJson[];
    metadata: {totalHits: number};
};

const SUMMARY_EXPAND = 1;

const rethrow = (error: Error): never => {
    throw error;
};

/** A page of the children of an archived item, or of the archive root when no parent is given. */
export function fetchArchivedChildren(parentId: string | undefined, from: number, size: number): Promise<ArchivedPage> {
    const url = withParams(getCmsRestUrl(ARCHIVE_ROOT, 'list'), {
        ...(parentId != null && {parentId}),
        expand: SUMMARY_EXPAND,
        from,
        size,
        childOrder: '',
    });

    return requestJson<ContentListJson>(url).match(
        (json) => ({
            items: ContentSummary.fromJsonArray(json.contents).map((summary) =>
                ContentSummaryAndCompareStatus.fromContentSummary(summary),
            ),
            total: json.metadata.totalHits,
        }),
        rethrow,
    );
}

export function fetchArchivedByIds(contentIds: string[]): Promise<ContentSummary[]> {
    if (contentIds.length === 0) {
        return Promise.resolve([]);
    }

    return requestJson<ContentListJson>(getCmsRestUrl(ARCHIVE_ROOT, 'resolveByIds'), {
        method: 'POST',
        body: {contentIds},
    }).match((json) => ContentSummary.fromJsonArray(json.contents), rethrow);
}

export function fetchArchivedDescendantIds(contentPaths: string[]): Promise<string[]> {
    return requestJson<{id: string}[]>(getCmsRestUrl(ARCHIVE_ROOT, 'getDescendantsOfContents'), {
        method: 'POST',
        body: {contentPaths},
    }).match((json) => json.map(({id}) => id), rethrow);
}

/** Starts the deletion and resolves with the id of its task. */
export function deleteArchived(contentPaths: string[]): Promise<string> {
    return requestJson<{taskId: string}>(getCmsRestUrl(ARCHIVE_ROOT, 'delete'), {
        method: 'POST',
        body: {contentPaths},
    }).match((json) => json.taskId, rethrow);
}

/** Starts the restore and resolves with the id of its task. */
export function restoreArchived(contentIds: string[]): Promise<string> {
    return requestJson<{taskId: string}>(getCmsRestUrl(ARCHIVE_ROOT, 'archive/restore'), {
        method: 'POST',
        body: {contentIds},
    }).match((json) => json.taskId, rethrow);
}
