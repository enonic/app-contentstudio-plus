import {useEffect, useState} from 'react';

const ELLIPSIS_INTERVAL_MS = 400;

export const useAnimatedEllipsis = (text: string, active = true): string => {
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (!active) {
            return;
        }

        const id = setInterval(() => setStep((prev) => (prev % 3) + 1), ELLIPSIS_INTERVAL_MS);
        return () => clearInterval(id);
    }, [active]);

    return active ? text.replace(/[.…]+$/, '') + '.'.repeat(step) : text;
};
