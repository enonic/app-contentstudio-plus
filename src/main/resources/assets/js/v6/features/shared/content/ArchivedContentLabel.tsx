import {cn, Tooltip} from '@enonic/ui';
import {CircleAlert, CircleCheck, CircleX, type LucideIcon} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../../../shared/i18n';
import {ContentIcon} from '../icons/ContentIcon';
import type {ArchivedContent, ContentState} from './archivedContent';
import {pathName} from './contentPath';
import {prettifyPath, resolveContentDisplay} from './contentDisplay';

export type ArchivedContentLabelProps = {
    content: ArchivedContent;
    /** `normal` shows the display name over the name; `compact` shows the full path on one line. */
    variant?: 'normal' | 'compact';
};

type StateBadge = {
    icon: LucideIcon;
    tooltipKey: string;
    className: string;
};

const STATE_BADGES: Record<ContentState, StateBadge> = {
    ready: {
        icon: CircleCheck,
        tooltipKey: 'tooltip.state.ready',
        className: 'text-success',
    },
    'in-progress': {
        icon: CircleAlert,
        tooltipKey: 'field.workflow.status.inProgress',
        className: 'text-warn [&>line]:stroke-rev [&>line:last-of-type]:translate-y-px',
    },
    invalid: {
        icon: CircleX,
        tooltipKey: 'field.invalid',
        className: 'text-error [&>path]:scale-[1.25]',
    },
};

const STATE_BADGE_CLASS_NAME = [
    'absolute -top-0.75 -right-0.75 rounded-full w-3.75 h-3.75',
    '[&>circle]:fill-current [&>path]:stroke-rev',
    '[&>path]:[vector-effect:non-scaling-stroke] [&>line]:[vector-effect:non-scaling-stroke]',
    '[&>path]:transform-fill [&>path]:origin-center [&>line]:transform-fill [&>line]:origin-center',
    '[&>path]:scale-[1.5]',
].join(' ');

// The UI tests find the badge and the label by the names Content Studio gives its own.
const STATE_BADGE_NAME = 'StatusIcon';

const ContentStateBadge = ({state}: {state: ContentState}): ReactElement => {
    const {icon: Icon, tooltipKey, className} = STATE_BADGES[state];
    const tooltip = useI18n(tooltipKey);

    return (
        <Tooltip side="top" delay={300} value={tooltip} trigger="hover">
            <Icon data-component={STATE_BADGE_NAME} className={cn(STATE_BADGE_CLASS_NAME, className)} aria-label={state} focusable="false" />
        </Tooltip>
    );
};

ContentStateBadge.displayName = 'ContentStateBadge';

const CONTENT_LABEL_NAME = 'ContentLabel';

export const ArchivedContentLabel = ({content, variant = 'normal'}: ArchivedContentLabelProps): ReactElement => {
    const isCompact = variant === 'compact';
    const path = prettifyPath(content.path);
    const primary = isCompact ? path : resolveContentDisplay(content).displayName;
    const secondary = isCompact ? undefined : pathName(path);

    return (
        <div data-component={CONTENT_LABEL_NAME} className="grid grid-cols-[auto_1fr] gap-2.5 items-center">
            <div className="flex items-center justify-center shrink-0 size-6 group-data-[tone=inverse]:text-alt">
                <span className="relative inline-flex items-center">
                    <ContentIcon contentType={content.type} url={content.iconUrl} hasThumbnail={content.hasThumbnail} />
                    {content.state && <ContentStateBadge state={content.state} />}
                </span>
            </div>

            <div className="flex flex-col text-left overflow-hidden">
                <span className="font-semibold leading-5.5 truncate w-full group-data-[tone=inverse]:text-alt">{primary}</span>

                {secondary && (
                    <small className="text-sm leading-4.5 text-subtle truncate w-full group-data-[tone=inverse]:text-alt">
                        {secondary}
                    </small>
                )}
            </div>
        </div>
    );
};

ArchivedContentLabel.displayName = 'ArchivedContentLabel';
