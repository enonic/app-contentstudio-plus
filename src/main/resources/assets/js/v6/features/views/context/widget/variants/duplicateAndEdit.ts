import {handleError} from '../../../../../../shared/errors';
import {getActiveProjectName} from '@enonic/lib-contentstudio/v6/entities/project/activeProject.store';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {type DuplicateParams, duplicateAsVariant} from '../../../../api/variants';
import {pathName} from '../../../../shared/content/contentPath';
import {openContentEditor} from '../../../../shared/content/openContentEditor';

const LISTENER_TIMEOUT_MS = 30_000;

type DuplicatedItem = {
    getId(): string;
    getContentSummary(): {getVariantOf(): string | undefined} | undefined;
    getPath(): {toString(): string};
};

// The duplicate runs as a task; the new variant is known only when the server event for it arrives.
export const duplicateAndEdit = (params: DuplicateParams, expectedVariantOf: string, expectedName: string): void => {
    const eventsHandler = ContentServerEventsHandler.getInstance();
    let cleared = false;

    const cleanup = (): void => {
        if (cleared) return;
        cleared = true;
        eventsHandler.unContentDuplicated(onDuplicated);
        clearTimeout(timeoutId);
    };

    const onDuplicated = (items: DuplicatedItem[]): void => {
        const created = items.find(item => {
            return item.getContentSummary()?.getVariantOf() === expectedVariantOf
                && pathName(item.getPath().toString()) === expectedName;
        });
        if (created) {
            cleanup();
            openContentEditor(getActiveProjectName(), created.getId(), {displayAsNew: true});
        }
    };

    const timeoutId = setTimeout(cleanup, LISTENER_TIMEOUT_MS);
    eventsHandler.onContentDuplicated(onDuplicated);

    duplicateAsVariant(params).catch((err: unknown) => {
        cleanup();
        handleError(err);
    });
};
