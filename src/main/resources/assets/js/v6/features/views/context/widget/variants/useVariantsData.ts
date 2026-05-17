import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {ContentSummaryAndCompareStatus} from '@enonic/lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ContentServerChangeItem} from '@enonic/lib-contentstudio/app/event/ContentServerChangeItem';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {ContentSummaryAndCompareStatusFetcher} from '@enonic/lib-contentstudio/app/resource/ContentSummaryAndCompareStatusFetcher';
import {useCallback, useEffect, useRef, useState} from 'react';
import {GetContentVariantsRequest} from '../../../../../../extension/variants/resource/request/GetContentVariantsRequest';

export type VariantsData = {
    original: ContentSummaryAndCompareStatus | null;
    variants: ContentSummaryAndCompareStatus[];
    loading: boolean;
    error: string | null;
    reload: () => void;
};

export const useVariantsData = (contentId: string): VariantsData => {
    const [original, setOriginal] = useState<ContentSummaryAndCompareStatus | null>(null);
    const [variants, setVariants] = useState<ContentSummaryAndCompareStatus[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    const load = useCallback((): void => {
        const requestId = ++requestIdRef.current;

        if (!contentId) {
            setOriginal(null);
            setVariants([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const fetcher = new ContentSummaryAndCompareStatusFetcher();

        fetcher
            .fetch(new ContentId(contentId))
            .then((content) => {
                if (requestId !== requestIdRef.current) return null;
                if (content.isVariant()) {
                    const originalId = content.getContentSummary().getVariantOf();
                    return fetcher.fetch(new ContentId(originalId));
                }
                return content;
            })
            .then((orig) => {
                if (!orig || requestId !== requestIdRef.current) return;
                setOriginal(orig);
                return new GetContentVariantsRequest(orig.getId())
                    .fetchWithCompareStatus()
                    .then((items) => {
                        if (requestId !== requestIdRef.current) return;
                        setVariants(items);
                    });
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

    const stateRef = useRef({original, variants});
    stateRef.current = {original, variants};

    useEffect(() => {
        const handler = ContentServerEventsHandler.getInstance();

        const isKnown = (id: string): boolean => {
            const {original: orig, variants: vars} = stateRef.current;
            return orig?.getId() === id || vars.some(v => v.getId() === id);
        };

        const onUpdated = (items: ContentSummaryAndCompareStatus[]): void => {
            if (items.some(item => isKnown(item.getId()))) load();
        };

        const onDuplicated = (items: ContentSummaryAndCompareStatus[]): void => {
            const {original: orig} = stateRef.current;
            if (!orig) return;
            if (items.some(item => item.getContentSummary()?.getVariantOf() === orig.getId())) {
                load();
            }
        };

        const onDeleted = (items: ContentServerChangeItem[]): void => {
            if (items.some(item => isKnown(item.getContentId().toString()))) load();
        };

        handler.onContentDuplicated(onDuplicated);
        handler.onContentDeleted(onDeleted);
        handler.onContentUpdated(onUpdated);
        return () => {
            handler.unContentDuplicated(onDuplicated);
            handler.unContentDeleted(onDeleted);
            handler.unContentUpdated(onUpdated);
        };
    }, [load]);

    return {original, variants, loading, error, reload: load};
};
