import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import {useI18n} from '@enonic/lib-contentstudio/v6/features/hooks/useI18n';
import {Checkbox, type CheckboxChecked, IconButton} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {RefreshCcw} from 'lucide-react';
import {type ReactElement, useMemo} from 'react';
import {loadArchiveItems} from '../../../store/archive-list';
import {
    $isAllSelected,
    $isNoneSelected,
    $selectionCount,
    clearSelection,
    selectAll,
    setActive,
} from '../../../store/archive-selection';

type ArchiveTreeListToolbarProps = {
    enabled?: boolean;
};

const handleReload = (): void => {
    clearSelection();
    setActive(null);
    void loadArchiveItems();
};

const ArchiveTreeListToolbar = ({enabled = true}: ArchiveTreeListToolbarProps): ReactElement => {
    const isAllSelected = useStore($isAllSelected);
    const totalSelected = useStore($selectionCount);
    const isNoneSelected = useStore($isNoneSelected);
    const selectAllPhrase = useI18n('field.selection.selectAll');
    const deselectAllPhrase = useI18n('field.selection.clear', totalSelected);
    const selectAllLabel = isNoneSelected ? selectAllPhrase : deselectAllPhrase;

    const checkedStatus = useMemo<CheckboxChecked>(() => {
        if (isAllSelected) return true;
        if (isNoneSelected) return false;
        return 'indeterminate';
    }, [isAllSelected, isNoneSelected]);

    const handleCheckboxClick = (): void => {
        if (isNoneSelected) {
            selectAll();
        } else {
            clearSelection();
        }
    };

    return (
        <div className="bg-surface-neutral flex items-center justify-between px-5 py-2.5 gap-2">
            <div className="ml-2.5 flex items-center gap-2.5">
                <Checkbox
                    aria-label={selectAllLabel}
                    label={selectAllLabel}
                    defaultChecked={false}
                    checked={checkedStatus}
                    disabled={!enabled}
                    onClick={handleCheckboxClick}
                />
            </div>

            <IconButton icon={RefreshCcw} disabled={!enabled} onClick={handleReload} />
        </div>
    );
};

ArchiveTreeListToolbar.displayName = 'ArchiveTreeListToolbar';

export class ArchiveTreeListToolbarElement extends LegacyElement<typeof ArchiveTreeListToolbar, ArchiveTreeListToolbarProps> {
    constructor(props?: ArchiveTreeListToolbarProps) {
        super(props ?? {}, ArchiveTreeListToolbar);
    }

    disable(): void {
        this.props.setKey('enabled', false);
    }

    enable(): void {
        this.props.setKey('enabled', true);
    }
}
