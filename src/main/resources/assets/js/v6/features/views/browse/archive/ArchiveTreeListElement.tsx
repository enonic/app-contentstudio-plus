import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {LegacyElement} from '@enonic/lib-contentstudio/v6/features/shared/LegacyElement';
import {SelectionChange} from '@enonic/lib-admin-ui/util/SelectionChange';
import {ArchiveContentViewItem} from '../../../../../ArchiveContentViewItem';
import {getArchiveItem} from '../../../store/archive-list';
import {$currentIds} from '../../../store/archive-selection';
import {ArchiveTreeList, type ArchiveTreeListProps} from './ArchiveTreeList';

export class ArchiveTreeListElement extends LegacyElement<typeof ArchiveTreeList, ArchiveTreeListProps> {

    private selectionChangedListeners: ((change: SelectionChange<ArchiveContentViewItem>) => void)[] = [];

    constructor() {
        super({}, ArchiveTreeList);
        this.initListeners();
    }

    private initListeners(): void {
        const unsubscribe = $currentIds.listen((currentIds, previousIds) => {
            this.notifySelectionChanged(this.toSelectionChange(new Set(currentIds), new Set(previousIds)));
        });

        this.onRemoved(() => {
            unsubscribe();
        });
    }

    onSelectionChanged(listener: (change: SelectionChange<ArchiveContentViewItem>) => void): void {
        this.selectionChangedListeners.push(listener);
    }

    setContextMenuActions(actions: Action[]): void {
        this.props.setKey('contextMenuActions', actions);
    }

    private notifySelectionChanged(change: SelectionChange<ArchiveContentViewItem>): void {
        this.selectionChangedListeners.forEach((listener) => listener(change));
    }

    private toSelectionChange(
        next: ReadonlySet<string>,
        prev: ReadonlySet<string>,
    ): SelectionChange<ArchiveContentViewItem> {
        const selected: ArchiveContentViewItem[] = [];
        const deselected: ArchiveContentViewItem[] = [];

        next.forEach((id) => {
            if (!prev.has(id)) {
                const item = getArchiveItem(id);
                if (item) {
                    selected.push(item);
                }
            }
        });

        prev.forEach((id) => {
            if (!next.has(id)) {
                const item = getArchiveItem(id);
                if (item) {
                    deselected.push(item);
                }
            }
        });

        return {selected, deselected};
    }
}
