import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {GridColumnConfig} from 'lib-admin-ui/ui/grid/GridColumn';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {Viewer} from 'lib-admin-ui/ui/Viewer';
import {ArchiveContentViewer} from './ArchiveContentViewer';
import {i18n} from 'lib-admin-ui/util/Messages';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {ContentPath} from 'lib-contentstudio/app/content/ContentPath';

interface ItemWithPath {
    getPath(): ContentPath;
}

export class ArchiveTreeGridHelper {

    static createTreeGridBuilder(): TreeGridBuilder<ArchiveViewItem> {
        return new TreeGridBuilder<ArchiveViewItem>()
            .setColumnConfig(ArchiveTreeGridHelper.createColumnConfig())
            .setPartialLoadEnabled(true)
            .setLoadBufferSize(10)
            .prependClasses('archive-tree-grid');
    }

    static createColumnConfig(): GridColumnConfig[] {
        return [{
            name: 'Name',
            id: 'displayName',
            field: 'displayName',
            formatter: ArchiveTreeGridHelper.nameFormatter,
            style: {cssClass: 'name', minWidth: 130}
        }, {
            name: 'CompareStatus',
            id: 'compareStatus',
            field: 'compareStatus',
            formatter: ArchiveTreeGridHelper.statusFormatter,
            style: {cssClass: 'status', minWidth: 75, maxWidth: 75}
        }];
    }

    public static nameFormatter({}: any, {}: any, {}: any, {}: any, dataContext: TreeNode<ArchiveViewItem>): string {
        return ArchiveTreeGridHelper.getViewerForArchiveItem(dataContext).toString();
    }

    public static statusFormatter(): string {
        return SpanEl.fromText(i18n('status.archived')).toString();
    }

    private static getViewerForArchiveItem(dataContext: TreeNode<ArchiveViewItem>): Viewer<any> {
        if (ObjectHelper.iFrameSafeInstanceOf(dataContext.getData(), ArchiveContentViewItem)) {
            const viewer: Viewer<ContentSummaryAndCompareStatus> = dataContext.getViewer('displayName') ||
                                                                   new ArchiveContentViewer();
            viewer.setObject((<ArchiveContentViewItem>dataContext.getData()).getData());

            return viewer;
        }

        return null;
    }
}
