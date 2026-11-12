import {handleError} from '../../../../../../shared/errors';
import {subscribeToContentEvents, subscribeToProjectChanges} from '../../../../../../shared/events';
import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchLayers} from '../../../../api/layers';
import type {LayerContent} from '../../../../shared/content/layerContent';
import {filterLayers} from './layersFilter';

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

        fetchLayers(contentId)
            .then((rawItems: LayerContent[]) => {
                if (requestId !== requestIdRef.current) return;
                setItems(filterLayers(rawItems));
            })
            .catch((err: unknown) => {
                if (requestId !== requestIdRef.current) return;
                handleError(err);
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
        const stopProjects = subscribeToProjectChanges(load);
        const stopContent = subscribeToContentEvents({
            onUpdated: (ids) => {
                if (ids.includes(contentId)) load();
            },
        });

        return () => {
            stopProjects();
            stopContent();
        };
    }, [contentId, load]);

    return {items, loading, error, reload: load};
};
