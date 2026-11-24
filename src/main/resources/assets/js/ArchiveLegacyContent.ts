import {ContentSummary} from '@enonic/lib-contentstudio/app/content/ContentSummary';
import type {ContentSummaryJson} from '@enonic/lib-contentstudio/app/content/ContentSummaryJson';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import type {ArchivedContent} from './v6/features/shared/content/archivedContent';

// The panels inherited from Content Studio take its content classes; everything else in the archive reads ArchivedContent.
const summaries = new WeakMap<ArchivedContent, ContentSummary>();
const viewItems = new WeakMap<ArchivedContent, ArchiveContentViewItem>();

export function toLegacySummary(content: ArchivedContent): ContentSummary {
    let summary = summaries.get(content);
    if (!summary) {
        summary = ContentSummary.fromJson(content.source as unknown as ContentSummaryJson);
        summaries.set(content, summary);
    }
    return summary;
}

export function toLegacyViewItem(content: ArchivedContent): ArchiveContentViewItem {
    let item = viewItems.get(content);
    if (!item) {
        item = new ArchiveContentViewItem(content.originalPath || content.path)
            .setContentSummary(toLegacySummary(content)) as ArchiveContentViewItem;
        viewItems.set(content, item);
    }
    return item;
}
