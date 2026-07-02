import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {useAction} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useAction';
import {ContextMenu} from '@enonic/ui';
import {ReactElement, ReactNode} from 'react';

export type ArchiveTreeContextMenuProps = {
    actions: Action[];
    children: ReactNode;
};

const ARCHIVE_TREE_CONTEXT_MENU_NAME = 'ArchiveTreeContextMenu';

export const ArchiveTreeContextMenu = ({children, actions = []}: ArchiveTreeContextMenuProps): ReactElement => {
    if (actions.length === 0) {
        return <>{children}</>;
    }

    return (
        <ContextMenu data-component={ARCHIVE_TREE_CONTEXT_MENU_NAME}>
            <ContextMenu.Trigger className="h-full">{children}</ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-36">
                    {actions.map((action) => (
                        <ArchiveTreeContextMenuAction key={action.getLabel()} action={action} />
                    ))}
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu>
    );
};

ArchiveTreeContextMenu.displayName = ARCHIVE_TREE_CONTEXT_MENU_NAME;

const ArchiveTreeContextMenuAction = ({action}: {action: Action}): ReactElement | null => {
    const {label, enabled, visible, execute} = useAction(action);

    if (!visible) {
        return null;
    }

    return (
        <ContextMenu.Item disabled={!enabled} onSelect={execute}>
            {label}
        </ContextMenu.Item>
    );
};

ArchiveTreeContextMenuAction.displayName = 'ArchiveTreeContextMenuAction';
