import {useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject} from 'react';

export type CardEntry = {
    cardEl: HTMLElement | null;
    buttonEls: HTMLButtonElement[];
};

type Options = {
    itemCount: number;
    onActiveIndexChange?: (index: number) => void;
    enableHorizontal?: boolean;
};

type Result = {
    containerRef: RefObject<HTMLDivElement>;
    handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
    handleClick: (event: MouseEvent<HTMLDivElement>) => void;
    registerEntry: (index: number, entry: CardEntry | null) => void;
    activeIndex: number;
    activeButtonIndex: number;
};

const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

export const useCardListKeyboard = ({
    itemCount,
    onActiveIndexChange,
    enableHorizontal = false,
}: Options): Result => {
    const containerRef = useRef<HTMLDivElement>(null);
    const entriesRef = useRef<Map<number, CardEntry>>(new Map());
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [activeButtonIndex, setActiveButtonIndex] = useState<number>(0);
    const skipFocusRef = useRef<boolean>(false);

    const getEntry = useCallback(
        (index: number): CardEntry | null => entriesRef.current.get(index) ?? null,
        [],
    );

    const registerEntry = useCallback((index: number, entry: CardEntry | null): void => {
        if (entry === null) {
            entriesRef.current.delete(index);
        } else {
            entriesRef.current.set(index, entry);
        }
    }, []);

    const resolveIndexFromTarget = useCallback((target: Node | null): number => {
        if (!target) return -1;
        for (const [index, entry] of entriesRef.current) {
            if (entry.cardEl?.contains(target)) return index;
        }
        return -1;
    }, []);

    const resolveButtonIndexFromTarget = useCallback((target: Node | null, cardIndex: number): number => {
        if (!target) return -1;
        const entry = entriesRef.current.get(cardIndex);
        if (!entry) return -1;
        return entry.buttonEls.findIndex(btn => btn === target);
    }, []);

    const moveTo = useCallback((next: number): void => {
        setActiveIndex(next);
        setActiveButtonIndex(0);
        onActiveIndexChange?.(next);
    }, [onActiveIndexChange]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>): void => {
        if (itemCount <= 0) return;

        const container = containerRef.current;
        const target = event.target as Node | null;
        if (!container || !target || !container.contains(target)) return;

        const resolved = resolveIndexFromTarget(target);
        const currentIndex = resolved >= 0 ? resolved : activeIndex;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const base = currentIndex < 0 ? -1 : currentIndex;
            const next = clamp(base + 1, 0, itemCount - 1);
            moveTo(next);
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            const base = currentIndex < 0 ? itemCount : currentIndex;
            const next = clamp(base - 1, 0, itemCount - 1);
            moveTo(next);
            return;
        }

        if (!enableHorizontal || currentIndex < 0) return;

        const entry = entriesRef.current.get(currentIndex);
        const buttons = entry?.buttonEls ?? [];
        if (buttons.length <= 1) return;

        const targetButtonIndex = resolveButtonIndexFromTarget(target, currentIndex);
        const baseButtonIndex = targetButtonIndex >= 0 ? targetButtonIndex : activeButtonIndex;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setActiveIndex(currentIndex);
            setActiveButtonIndex(clamp(baseButtonIndex + 1, 0, buttons.length - 1));
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setActiveIndex(currentIndex);
            setActiveButtonIndex(clamp(baseButtonIndex - 1, 0, buttons.length - 1));
        }
    }, [
        activeIndex,
        activeButtonIndex,
        itemCount,
        enableHorizontal,
        moveTo,
        resolveIndexFromTarget,
        resolveButtonIndexFromTarget,
    ]);

    const handleClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
        if (itemCount <= 0) return;
        const target = event.target as Node | null;
        const resolved = resolveIndexFromTarget(target);
        if (resolved < 0) return;
        const targetButtonIndex = resolveButtonIndexFromTarget(target, resolved);
        skipFocusRef.current = true;
        setActiveIndex(resolved);
        setActiveButtonIndex(targetButtonIndex >= 0 ? targetButtonIndex : 0);
        if (targetButtonIndex < 0) {
            entriesRef.current.get(resolved)?.cardEl?.focus();
        }
    }, [itemCount, resolveIndexFromTarget, resolveButtonIndexFromTarget]);

    useEffect(() => {
        if (activeIndex >= itemCount) {
            setActiveIndex(itemCount > 0 ? itemCount - 1 : -1);
        }
    }, [itemCount, activeIndex]);

    useLayoutEffect(() => {
        if (activeIndex < 0) return;
        if (skipFocusRef.current) {
            skipFocusRef.current = false;
            return;
        }
        const entry = entriesRef.current.get(activeIndex);
        if (!entry) return;
        const {cardEl, buttonEls} = entry;
        if (buttonEls.length > 0) {
            const idx = clamp(activeButtonIndex, 0, buttonEls.length - 1);
            buttonEls[idx]?.focus();
        } else {
            cardEl?.focus();
        }
    }, [activeIndex, activeButtonIndex]);

    return {containerRef, handleKeyDown, handleClick, registerEntry, activeIndex, activeButtonIndex};
};
