import {handleError} from '../../../../../../shared/errors';
import {getActiveProjectName} from '../../../../../../shared/project';
import {type ContentNode, subscribeToContentEvents} from '../../../../../../shared/events';
import {type DuplicateParams, duplicateAsVariant, fetchContent} from '../../../../api/variants';
import {pathName} from '../../../../shared/content/contentPath';
import {openContentEditor} from '../../../../shared/content/openContentEditor';

const LISTENER_TIMEOUT_MS = 30_000;

// The duplicate runs as a task; the new variant is known only when the server event for it arrives.
export const duplicateAndEdit = (params: DuplicateParams, expectedVariantOf: string, expectedName: string): void => {
    let cleared = false;

    const cleanup = (): void => {
        if (cleared) return;
        cleared = true;
        stopListening();
        clearTimeout(timeoutId);
    };

    const onDuplicated = (nodes: ContentNode[]): void => {
        const candidate = nodes.find((node) => pathName(node.path) === expectedName);
        if (!candidate) return;

        fetchContent(candidate.id)
            .then((copy) => {
                if (cleared || copy.variantOf !== expectedVariantOf) return;
                cleanup();
                openContentEditor(getActiveProjectName(), copy.id, {displayAsNew: true});
            })
            .catch(handleError);
    };

    const timeoutId = setTimeout(cleanup, LISTENER_TIMEOUT_MS);
    const stopListening = subscribeToContentEvents({onDuplicated});

    duplicateAsVariant(params).catch((err: unknown) => {
        cleanup();
        handleError(err);
    });
};
