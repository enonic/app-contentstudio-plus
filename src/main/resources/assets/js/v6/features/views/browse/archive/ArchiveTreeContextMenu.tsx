import {ContextMenu} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {ReactElement, ReactNode} from 'react';
import {useI18n} from '../../../../../shared/i18n';
import {
    $archiveActionsEnabled,
    ARCHIVE_ACTIONS,
    executeArchiveAction,
    type ArchiveAction,
} from '../../../store/archive-actions';

export type ArchiveTreeContextMenuProps = {
    children: ReactNode;
};

const ARCHIVE_TREE_CONTEXT_MENU_NAME = 'ArchiveTreeContextMenu';

export const ArchiveTreeContextMenu = ({children}: ArchiveTreeContextMenuProps): ReactElement => {
    return (
        <ContextMenu data-component={ARCHIVE_TREE_CONTEXT_MENU_NAME}>
            <ContextMenu.Trigger className="h-full">{children}</ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-36">
                    {ARCHIVE_ACTIONS.map((action) => (
                        <ArchiveTreeContextMenuAction key={action.id} action={action} />
                    ))}
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu>
    );
};

ArchiveTreeContextMenu.displayName = ARCHIVE_TREE_CONTEXT_MENU_NAME;

const ArchiveTreeContextMenuAction = ({action}: {action: ArchiveAction}): ReactElement => {
    const label = useI18n(action.labelKey);
    const enabled = useStore($archiveActionsEnabled);

    return (
        <ContextMenu.Item disabled={!enabled} onSelect={() => executeArchiveAction(action.id)}>
            {label}
        </ContextMenu.Item>
    );
};

ArchiveTreeContextMenuAction.displayName = 'ArchiveTreeContextMenuAction';
