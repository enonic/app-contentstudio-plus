import * as Q from 'q';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {TreeListBox, TreeListBoxParams, TreeListElement, TreeListElementParams} from '@enonic/lib-admin-ui/ui/selector/list/TreeListBox';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {ArchiveContentFetcher} from './ArchiveContentFetcher';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';
import {FetchResponse} from './FetchResponse';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {ArchiveListItemViewer} from './ArchiveListItemViewer';

export class ArchiveTreeList
    extends TreeListBox<ArchiveContentViewItem> {

    protected readonly fetcher: ArchiveContentFetcher;

    constructor(params?: TreeListBoxParams<ArchiveContentViewItem>) {
        super(params);

        this.fetcher = new ArchiveContentFetcher();
    }

    protected createItemView(item: ArchiveContentViewItem, readOnly: boolean): ArchiveTreeListElement {
        return new ArchiveTreeListElement(item, {scrollParent: this.scrollParent, parentList: this});
    }

    protected getItemId(item: ArchiveContentViewItem): string {
        return item.getId();
    }

    protected handleLazyLoad(): void {
        this.fetch().then((fetchResponse: FetchResponse) => {
            if (fetchResponse.total > 0) {
                this.addItems(this.createNewArchiveItems(fetchResponse));
            }
        }).catch(DefaultErrorHandler.handle);
    }

    private fetch(): Q.Promise<FetchResponse> {
        return this.isRootList() ? this.fetchRootItems() : this.fetchItems();
    }

    protected isRootList(): boolean {
        return !this.getParentItem();
    }

    protected fetchRootItems(): Q.Promise<FetchResponse> {
        return this.fetchItems();
    }

    protected fetchItems(): Q.Promise<FetchResponse> {
        const from: number = this.getItemCount();
        const parent = this.getParentItem()?.getContentId();

        return this.fetcher.fetchContents(parent, from);
    }

    private createNewArchiveItems(fetchResponse: FetchResponse): ArchiveContentViewItem[] {
        return fetchResponse.items.map((c: ContentSummaryAndCompareStatus) => {
            return new ArchiveContentViewItem(this.getParentPath(c))
                .setContentSummary(c.getContentSummary())
                .setCompareStatus(c.getCompareStatus()) as ArchiveContentViewItem;
        });
    }

    private getParentPath(content: ContentSummaryAndCompareStatus): string {
        if (this.getParentItem()) {
            return this.getParentItem().getOriginalParentPath();
        }

        return this.getOriginalParentPathForRootItem(content);
    }

    private getOriginalParentPathForRootItem(item: ContentSummaryAndCompareStatus): string {
        const originalParentPath: string = item.getContentSummary().getOriginalParentPath();
        const originalName: string = item.getContentSummary().getOriginalName();

        if (!originalParentPath || !originalName) {
            return item.getPath().toString();
        }

        const separator: string = originalParentPath.endsWith(ContentPath.NODE_PATH_DIVIDER) ? '' : ContentPath.NODE_PATH_DIVIDER;

        return `${originalParentPath}${separator}${originalName}`;
    }

    load(): void {
        this.clearItems(true);
        this.handleLazyLoad();
    }

    findParentLists(item: ArchiveContentViewItem): ArchiveTreeList[] {
        const parents: ArchiveTreeList[] = [];
        const itemPath = item.getPath();
        const thisPath = this.getParentItem()?.getPath() || ContentPath.getRoot();

        if (itemPath.isDescendantOf(thisPath)) {
            if (itemPath.isChildOf(thisPath)) {
                parents.push(this);
            }

            this.getItemViews().forEach((listElement: ArchiveTreeListElement) => {
                const moreParents = listElement.findParentLists(item);

                if (moreParents.length > 0) {
                    parents.push(...moreParents);
                }
            });
        }

        return parents;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('archive-tree-list');

            return rendered;
        });
    }

}

export class ArchiveTreeListElement extends TreeListElement<ArchiveContentViewItem> {

    protected childrenList: ArchiveTreeList;

    private containsChildren: boolean;

    constructor(content: ArchiveContentViewItem, params: TreeListElementParams<ArchiveContentViewItem>) {
        super(content, params);
    }

    protected initElements(): void {
        this.containsChildren = this.item.hasChildren();
        super.initElements();
    }

    protected createChildrenList(params?: TreeListElementParams<ArchiveContentViewItem>): ArchiveTreeList {
        return new ArchiveTreeList(params);
    }

    hasChildren(): boolean {
        return this.containsChildren;
    }

    setContainsChildren(value: boolean): void {
        this.containsChildren = value;
        this.updateExpandableState();
    }

    protected createItemViewer(item: ArchiveContentViewItem): ArchiveListItemViewer {
        const viewer = new ArchiveListItemViewer();
        viewer.setItem(item);
        return viewer;
    }

    findParentLists(item: ArchiveContentViewItem): ArchiveTreeList[] {
        return this.childrenList.findParentLists(item);
    }

    setItem(item: ArchiveContentViewItem): void {
        super.setItem(item);
        (this.itemViewer as ArchiveListItemViewer).setItem(item);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('content-tree-list-element');

            return rendered;
        });
    }

}
