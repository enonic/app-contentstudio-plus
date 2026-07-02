import {cn, ListItem, VirtualizedTreeList} from '@enonic/ui';
import {ContentLabel} from '@enonic/lib-contentstudio/v6/entities/content/ui/content/ContentLabel';
import {virtuosoComponents} from '@enonic/lib-contentstudio/v6/features/shared/lists/virtuoso-components';
import type {FlatNode} from '@enonic/lib-contentstudio/v6/shared/lib/tree-store';
import {useStore} from '@nanostores/preact';
import {type ReactElement, useCallback, useEffect, useMemo, useRef} from 'react';
import type {ListRange, VirtuosoHandle} from 'react-virtuoso';
import {Virtuoso} from 'react-virtuoso';
import {ArchiveContentViewItem} from '../../../../../ArchiveContentViewItem';
import {
    $archiveFlatNodes,
    $archiveListState,
    $hasMoreArchiveItems,
    collapseArchiveNode,
    expandArchiveNode,
    loadMoreArchiveItems,
    loadMoreChildrenOf,
} from '../../../store/archive-list';
import {
    $activeId,
    $selection,
    clearSelection,
    setActive,
    setSelection,
} from '../../../store/archive-selection';
import {ArchiveTreeContextMenu, type ArchiveTreeContextMenuProps} from './ArchiveTreeContextMenu';

type ArchiveFlatNode = FlatNode<ArchiveContentViewItem>;

export type ArchiveTreeListProps = {
    contextMenuActions?: ArchiveTreeContextMenuProps['actions'];
};

const ARCHIVE_TREE_LIST_NAME = 'ArchiveTreeList';

export const ArchiveTreeList = ({contextMenuActions = []}: ArchiveTreeListProps): ReactElement => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const suppressNextClickForIdRef = useRef<string | null>(null);
    const flatNodes = useStore($archiveFlatNodes);
    const selection = useStore($selection);
    const activeId = useStore($activeId);
    const listState = useStore($archiveListState);
    const hasMore = useStore($hasMoreArchiveItems);

    const handleActivate = useCallback((_id: string) => {
        // archive items don't have an "edit" action; activation is a no-op
    }, []);

    const handleExpand = useCallback((id: string) => {
        expandArchiveNode(id);
    }, []);

    const handleCollapse = useCallback((id: string) => {
        collapseArchiveNode(id);
    }, []);

    const handleSelectionChange = useCallback((newSelection: ReadonlySet<string>) => {
        setSelection(newSelection);
    }, []);

    const visibleIds = useMemo(
        () => new Set(flatNodes.map((n) => n.id)),
        [flatNodes],
    );

    const visibleSelection = useMemo(
        () => new Set([...selection].filter((id) => visibleIds.has(id))),
        [selection, visibleIds],
    );

    const pendingChildLoadParentIds = useMemo(() => {
        const parentIds = new Set<string>();
        for (const node of flatNodes) {
            if (node.nodeType === 'loading' && node.parentId !== null) {
                parentIds.add(node.parentId);
            }
        }
        return [...parentIds];
    }, [flatNodes]);

    useEffect(() => {
        for (const parentId of pendingChildLoadParentIds) {
            void loadMoreChildrenOf(parentId);
        }
    }, [pendingChildLoadParentIds]);

    const handleRangeChange = useCallback(
        (range: ListRange) => {
            const startIndex = Math.max(0, range.startIndex);
            const endIndex = Math.min(flatNodes.length - 1, range.endIndex);
            const triggeredParents = new Set<string>();

            for (let i = startIndex; i <= endIndex; i++) {
                const node = flatNodes[i];
                if (node?.nodeType === 'loading' && node.parentId !== null && !triggeredParents.has(node.parentId)) {
                    triggeredParents.add(node.parentId);
                    void loadMoreChildrenOf(node.parentId);
                }
            }

            if (hasMore && !listState.loading) {
                const threshold = Math.max(0, flatNodes.length - 5);
                if (range.endIndex >= threshold) {
                    void loadMoreArchiveItems();
                }
            }
        },
        [flatNodes, hasMore, listState.loading],
    );

    return (
        <VirtualizedTreeList
            data-component={ARCHIVE_TREE_LIST_NAME}
            items={flatNodes}
            selection={visibleSelection}
            onSelectionChange={handleSelectionChange}
            selectionMode="multiple"
            active={activeId}
            onActiveChange={setActive}
            onExpand={handleExpand}
            onCollapse={handleCollapse}
            onActivate={handleActivate}
            clearActiveOnReclick={true}
            virtuosoRef={virtuosoRef}
            aria-label="Archive content"
            className="w-full flex-1 min-h-0 archive-tree-list"
        >
            {({items, getItemProps, containerProps}) => {
                const {className: containerClassName, ...restContainerProps} = containerProps;
                return (
                    <ArchiveTreeContextMenu actions={contextMenuActions}>
                        <Virtuoso<ArchiveFlatNode>
                            ref={virtuosoRef}
                            data={items as ArchiveFlatNode[]}
                            className={cn('h-full px-5 py-2.5 bg-surface-neutral', containerClassName)}
                            components={virtuosoComponents}
                            rangeChanged={handleRangeChange}
                            {...restContainerProps}
                            itemContent={(index, node) => {
                                const {id, data, level, isExpanded, hasChildren, nodeType} = node;

                                if (nodeType === 'loading' || !data) {
                                    return (
                                        <VirtualizedTreeList.RowLoading level={level} className="min-h-12" />
                                    );
                                }

                                const itemProps = getItemProps(index, node);
                                const isSelected = selection.has(id);
                                const isActive = activeId === id;
                                const showAsSelected = isSelected || (isActive && selection.size === 0);
                                const activeAsSelected = showAsSelected && !isSelected;

                                return (
                                    <VirtualizedTreeList.Row
                                        {...itemProps}
                                        active={activeAsSelected ? false : itemProps.active}
                                        selected={showAsSelected}
                                        data-tone={showAsSelected ? 'inverse' : undefined}
                                        onContextMenu={() => {
                                            suppressNextClickForIdRef.current = id;
                                            if (!isSelected && !isActive) {
                                                if (selection.size > 0) {
                                                    clearSelection();
                                                }
                                                setActive(id);
                                            }
                                        }}
                                        onClick={(e) => {
                                            if (suppressNextClickForIdRef.current === id) {
                                                suppressNextClickForIdRef.current = null;
                                                return;
                                            }
                                            if (e.button !== 0 || e.ctrlKey) {
                                                return;
                                            }

                                            const tree = e.currentTarget.closest<HTMLElement>('[role="tree"]');
                                            tree?.focus();

                                            if (selection.size > 0) {
                                                clearSelection();
                                                setActive(id);
                                            } else if (activeId === id) {
                                                setActive(null);
                                            } else {
                                                setActive(id);
                                            }
                                        }}
                                    >
                                        <VirtualizedTreeList.RowLeft>
                                            <VirtualizedTreeList.RowSelectionControl
                                                rowId={id}
                                                selected={itemProps.selected}
                                            />
                                            <VirtualizedTreeList.RowLevelSpacer level={level} />
                                            <VirtualizedTreeList.RowExpandControl
                                                rowId={id}
                                                expanded={isExpanded}
                                                hasChildren={hasChildren}
                                                onToggle={() =>
                                                    isExpanded ? handleCollapse(id) : handleExpand(id)
                                                }
                                                selected={showAsSelected}
                                            />
                                        </VirtualizedTreeList.RowLeft>
                                        <VirtualizedTreeList.RowContent>
                                            <ListItem className="p-0">
                                                <ListItem.Left className="flex-1">
                                                    <ContentLabel content={data.getContentSummary()} />
                                                </ListItem.Left>
                                            </ListItem>
                                        </VirtualizedTreeList.RowContent>
                                    </VirtualizedTreeList.Row>
                                );
                            }}
                        />
                    </ArchiveTreeContextMenu>
                );
            }}
        </VirtualizedTreeList>
    );
};

ArchiveTreeList.displayName = ARCHIVE_TREE_LIST_NAME;
