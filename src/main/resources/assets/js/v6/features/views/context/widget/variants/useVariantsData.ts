import {handleError} from '../../../../../../shared/errors';
import {ContentServerEventsHandler} from '@enonic/lib-contentstudio/app/event/ContentServerEventsHandler';
import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchContent, fetchVariants} from '../../../../api/variants';
import type {VariantContent} from '../../../../shared/content/variantContent';

export type VariantsData = {
    original: VariantContent | null;
    variants: VariantContent[];
    loading: boolean;
    error: string | null;
    reload: () => void;
};

type ContentItem = {
    getId(): string;
    getContentSummary(): {getVariantOf(): string | undefined} | undefined;
};

type DeletedItem = {
    getContentId(): {toString(): string};
};

const fetchOriginal = async (contentId: string): Promise<VariantContent> => {
    const content = await fetchContent(contentId);
    return content.variantOf ? fetchContent(content.variantOf) : content;
};

export const useVariantsData = (contentId: string): VariantsData => {
    const [original, setOriginal] = useState<VariantContent | null>(null);
    const [variants, setVariants] = useState<VariantContent[]>([]);
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

        fetchOriginal(contentId)
            .then(async (orig) => {
                if (requestId !== requestIdRef.current) return;
                setOriginal(orig);
                const items = await fetchVariants(orig.id);
                if (requestId !== requestIdRef.current) return;
                setVariants(items);
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

    const stateRef = useRef({original, variants});
    stateRef.current = {original, variants};

    useEffect(() => {
        const handler = ContentServerEventsHandler.getInstance();

        const isKnown = (id: string): boolean => {
            const {original: orig, variants: vars} = stateRef.current;
            return orig?.id === id || vars.some(v => v.id === id);
        };

        const onUpdated = (items: ContentItem[]): void => {
            if (items.some(item => isKnown(item.getId()))) load();
        };

        const onDuplicated = (items: ContentItem[]): void => {
            const {original: orig} = stateRef.current;
            if (!orig) return;
            if (items.some(item => item.getContentSummary()?.getVariantOf() === orig.id)) {
                load();
            }
        };

        const onDeleted = (items: DeletedItem[]): void => {
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
