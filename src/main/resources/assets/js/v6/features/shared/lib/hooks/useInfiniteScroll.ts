import {type RefObject, useEffect, useRef} from 'react';

type UseInfiniteScrollOptions = {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
};

/** Calls `onLoadMore` when the element the returned ref is attached to comes near the viewport. */
export const useInfiniteScroll = <T extends HTMLElement>({
    hasMore,
    isLoading,
    onLoadMore,
}: UseInfiniteScrollOptions): RefObject<T | null> => {
    const sentinelRef = useRef<T | null>(null);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!hasMore || isLoading || !node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {rootMargin: '200px', threshold: 0.1},
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, [hasMore, isLoading, onLoadMore]);

    return sentinelRef;
};
