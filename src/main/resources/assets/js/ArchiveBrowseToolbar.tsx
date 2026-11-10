import {
    $isContentFilterDirty,
    $isContentFilterOpen,
    setContentFilterOpen,
} from '@enonic/lib-contentstudio/v6/features/search/model/contentFilter.store';
import {ContextToggle} from '@enonic/lib-contentstudio/v6/widgets/browse-toolbar/ContextToggle';
import {Button, Toggle, Toolbar, Tooltip} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Search, ZoomIn} from 'lucide-react';
import {type ReactElement, useEffect, useRef} from 'react';
import {useI18n} from './shared/i18n';
import {LegacyElement} from './shared/LegacyElement';
import {
    $archiveActionsEnabled,
    ARCHIVE_ACTIONS,
    executeArchiveAction,
    type ArchiveAction,
} from './v6/features/store/archive-actions';

const ARCHIVE_BROWSE_TOOLBAR_NAME = 'ArchiveBrowseToolbar';

const ArchiveSearchToggle = (): ReactElement => {
    const toggleRef = useRef<HTMLButtonElement>(null);
    const isFilterOpen = useStore($isContentFilterOpen);
    const isFilterDirty = useStore($isContentFilterDirty);
    const wasFilterOpen = useRef(isFilterOpen);
    const showLabel = useI18n('tooltip.filterPanel.show');
    const hideLabel = useI18n('tooltip.filterPanel.hide');
    const label = isFilterOpen ? hideLabel : showLabel;

    // Closing the filter panel hides the focused search input, so focus returns here.
    useEffect(() => {
        if (wasFilterOpen.current && !isFilterOpen) {
            toggleRef.current?.focus();
        }
        wasFilterOpen.current = isFilterOpen;
    }, [isFilterOpen]);

    return (
        <Tooltip side="bottom" delay={300} value={label} asChild>
            <Toolbar.Item asChild>
                <Toggle
                    ref={toggleRef}
                    className="size-9 p-0"
                    size="sm"
                    iconStrokeWidth={2}
                    startIconClassName="max-sm:size-5 max-sm:[stroke-width:1.5]"
                    aria-label={label}
                    startIcon={isFilterDirty ? ZoomIn : Search}
                    pressed={isFilterOpen}
                    onPressedChange={() => setContentFilterOpen(!isFilterOpen)}
                />
            </Toolbar.Item>
        </Tooltip>
    );
};

ArchiveSearchToggle.displayName = 'ArchiveSearchToggle';

const ArchiveActionButton = ({action}: {action: ArchiveAction}): ReactElement => {
    const label = useI18n(action.labelKey);
    const enabled = useStore($archiveActionsEnabled);

    return (
        <Toolbar.Item asChild disabled={!enabled}>
            <Button size="sm" label={label} onClick={() => executeArchiveAction(action.id)} />
        </Toolbar.Item>
    );
};

ArchiveActionButton.displayName = 'ArchiveActionButton';

export const ArchiveBrowseToolbar = (): ReactElement => {
    return (
        <Toolbar data-component={ARCHIVE_BROWSE_TOOLBAR_NAME}>
            <Toolbar.Container
                aria-label="Archive toolbar"
                className="bg-surface-neutral h-15 px-3.5 max-sm:pr-4 sm:px-5 py-2 flex items-center gap-2.5 sm:gap-2 border-b border-bdr-soft"
            >
                <div className="flex min-w-fit items-center gap-2">
                    <ArchiveSearchToggle />
                    <div className="flex items-center gap-2" tabIndex={-1}>
                        {ARCHIVE_ACTIONS.map((action) => (
                            <ArchiveActionButton key={action.id} action={action} />
                        ))}
                    </div>
                </div>
                <div className="flex-1" />
                <ContextToggle className="shrink-0 size-7.5 sm:size-9" />
            </Toolbar.Container>
        </Toolbar>
    );
};

ArchiveBrowseToolbar.displayName = ARCHIVE_BROWSE_TOOLBAR_NAME;

export class ArchiveBrowseToolbarElement extends LegacyElement<typeof ArchiveBrowseToolbar> {
    constructor() {
        super({}, ArchiveBrowseToolbar);
    }
}
