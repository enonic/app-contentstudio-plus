import {Fragment, type ReactElement, type ReactNode} from 'react';

export type TextAndDateEntry = {
    text: string;
    date: string;
};

export type TextAndDateProps = {
    entries: TextAndDateEntry[];
    icon?: ReactNode;
    iconClassName?: string;
    className?: string;
};

export const TextAndDate = ({entries, icon, iconClassName, className}: TextAndDateProps): ReactElement => (
    <div className={`flex items-center gap-2 text-sm ${className ?? ''}`}>
        {icon && <span className={`inline-flex shrink-0 ${iconClassName ?? ''}`}>{icon}</span>}
        {entries.map(({text, date}, index) => (
            <Fragment key={index}>
                <span className="text-subtle">{text}</span>
                <span className="font-medium">{date}</span>
            </Fragment>
        ))}
    </div>
);

TextAndDate.displayName = 'TextAndDate';
