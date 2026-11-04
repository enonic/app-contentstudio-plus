import {cn} from '@enonic/ui';
import type {ReactElement} from 'react';

const PROGRESS_BAR_NAME = 'ProgressBar';

export type ProgressBarProps = {
    value: number;
    className?: string;
};

const clamp = (value: number): number => (Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0);

export const ProgressBar = ({value, className}: ProgressBarProps): ReactElement => {
    const normalized = clamp(value);

    return (
        <div
            data-component={PROGRESS_BAR_NAME}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={normalized}
            className={cn('h-5 w-full overflow-hidden rounded-lg bg-surface-selected', className)}
        >
            <div
                aria-hidden
                className="h-full rounded-l-lg bg-success-rev transition-[width] duration-300 ease-out"
                style={{width: `${normalized}%`}}
            />
        </div>
    );
};

ProgressBar.displayName = PROGRESS_BAR_NAME;
