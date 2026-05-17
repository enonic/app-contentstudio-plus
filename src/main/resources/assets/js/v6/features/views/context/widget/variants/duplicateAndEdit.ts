import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentEventsProcessor} from '@enonic/lib-contentstudio/app/ContentEventsProcessor';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {EditContentEvent} from '@enonic/lib-contentstudio/app/event/EditContentEvent';
import {ContentDuplicateParams} from '@enonic/lib-contentstudio/app/resource/ContentDuplicateParams';
import {DuplicateContentRequest} from '@enonic/lib-contentstudio/app/resource/DuplicateContentRequest';

const LISTENER_TIMEOUT_MS = 30_000;

/**
 * Sends a DuplicateContentRequest, then listens for the duplicated server event
 * and opens the newly created variant in a tab. Mirrors legacy setOpenTabAfterDuplicate(true).
 */
export const duplicateAndEdit = (params: ContentDuplicateParams, expectedVariantOf: string, expectedName: string): void => {
    const eventsHandler = ContentServerEventsHandler.getInstance();
    let cleared = false;

    const cleanup = (): void => {
        if (cleared) return;
        cleared = true;
        eventsHandler.unContentDuplicated(onDuplicated);
        clearTimeout(timeoutId);
    };

    const onDuplicated = (items: ContentSummaryAndCompareStatus[]): void => {
        const created = items.find(item => {
            const summary = item.getContentSummary();
            return summary?.getVariantOf() === expectedVariantOf && item.getPath().getName() === expectedName;
        });
        if (created) {
            cleanup();
            ContentEventsProcessor.handleEdit(new EditContentEvent([created]));
        }
    };

    const timeoutId = setTimeout(cleanup, LISTENER_TIMEOUT_MS);
    eventsHandler.onContentDuplicated(onDuplicated);

    new DuplicateContentRequest([params])
        .sendAndParse()
        .catch((err: unknown) => {
            cleanup();
            DefaultErrorHandler.handle(err);
        });
};
