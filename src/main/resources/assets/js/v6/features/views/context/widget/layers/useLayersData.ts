import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {ProjectCreatedEvent} from '@enonic/lib-contentstudio/app/settings/event/ProjectCreatedEvent';
import {ProjectDeletedEvent} from '@enonic/lib-contentstudio/app/settings/event/ProjectDeletedEvent';
import {ProjectUpdatedEvent} from '@enonic/lib-contentstudio/app/settings/event/ProjectUpdatedEvent';
import {useCallback, useEffect, useRef, useState} from 'react';
import {LayerContent} from '../../../../../../extension/layers/LayerContent';
import {MultiLayersContentFilter} from '../../../../../../extension/layers/MultiLayersContentFilter';
import {GetLayersRequest} from '../../../../../../resource/GetLayersRequest';

export type LayersData = {
    items: LayerContent[];
    loading: boolean;
    error: string | null;
    reload: () => void;
};

export const useLayersData = (contentId: string): LayersData => {
    const [items, setItems] = useState<LayerContent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    const load = useCallback((): void => {
        const requestId = ++requestIdRef.current;

        if (!contentId) {
            setItems([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        new GetLayersRequest(new ContentId(contentId))
            .sendAndParse()
            .then((rawItems: LayerContent[]) => {
                if (requestId !== requestIdRef.current) return;
                const filtered = new MultiLayersContentFilter().filter(rawItems);
                setItems(filtered);
            })
            .catch((err: unknown) => {
                if (requestId !== requestIdRef.current) return;
                DefaultErrorHandler.handle(err);
                setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (requestId !== requestIdRef.current) return;
                setLoading(false);
            });
    }, [contentId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        ProjectCreatedEvent.on(load);
        ProjectUpdatedEvent.on(load);
        ProjectDeletedEvent.on(load);

        const serverEventsHandler = ContentServerEventsHandler.getInstance();
        const updateHandler = (updated: {getId(): string}[]): void => {
            if (updated.some(item => item.getId() === contentId)) {
                load();
            }
        };
        serverEventsHandler.onContentUpdated(updateHandler);

        return () => {
            ProjectCreatedEvent.un(load);
            ProjectUpdatedEvent.un(load);
            ProjectDeletedEvent.un(load);
            serverEventsHandler.unContentUpdated(updateHandler);
        };
    }, [contentId, load]);

    return {items, loading, error, reload: load};
};
