import {type Action} from '@enonic/lib-admin-ui/ui/Action';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/shared/ui/LegacyElement';
import {ActionGroup} from '@enonic/lib-contentstudio/v6/widgets/browse-toolbar/ActionGroup';
import {ContextToggle} from '@enonic/lib-contentstudio/v6/widgets/browse-toolbar/ContextToggle';
import {SearchToggle} from '@enonic/lib-contentstudio/v6/widgets/browse-toolbar/SearchToggle';
import {ToolbarActionButton} from '@enonic/lib-contentstudio/v6/widgets/browse-toolbar/ToolbarActionButton';
import {Toolbar} from '@enonic/ui';
import {type ReactElement} from 'react';

type ArchiveBrowseToolbarProps = {
    toggleFilterPanelAction: Action;
    actions: Action[];
};

const ARCHIVE_BROWSE_TOOLBAR_NAME = 'ArchiveBrowseToolbar';

export const ArchiveBrowseToolbar = ({toggleFilterPanelAction, actions}: ArchiveBrowseToolbarProps): ReactElement => {
    return (
        <Toolbar data-component={ARCHIVE_BROWSE_TOOLBAR_NAME}>
            <Toolbar.Container
                aria-label="Archive toolbar"
                className="bg-surface-neutral h-15 px-5 py-2 flex items-center gap-2 border-b border-bdr-soft"
            >
                <SearchToggle action={toggleFilterPanelAction} />
                <ActionGroup>
                    {actions.map((action) => (
                        <ToolbarActionButton key={action.getLabel()} action={action} />
                    ))}
                </ActionGroup>
                <div className="flex-1" />
                <ContextToggle className="shrink-0" />
            </Toolbar.Container>
        </Toolbar>
    );
};

ArchiveBrowseToolbar.displayName = ARCHIVE_BROWSE_TOOLBAR_NAME;

export class ArchiveBrowseToolbarElement extends LegacyElement<typeof ArchiveBrowseToolbar, ArchiveBrowseToolbarProps> {
    constructor(props: ArchiveBrowseToolbarProps) {
        super(props, ArchiveBrowseToolbar);
    }
}
