import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {GridColumnConfig} from 'lib-admin-ui/ui/grid/GridColumn';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {ArchiveViewItem} from './ArchiveViewItem';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';
import {Viewer} from 'lib-admin-ui/ui/Viewer';
import {ArchiveBundleViewItem} from './ArchiveBundleViewItem';
import {ArchiveBundleViewer} from './ArchiveBundleViewer';
import {ArchiveContentViewer} from './ArchiveContentViewer';

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
        }];
    }

    public static nameFormatter({}: any, {}: any, {}: any, {}: any, dataContext: TreeNode<ArchiveViewItem>) {
        return ArchiveTreeGridHelper.getViewerForArchiveItem(dataContext).toString();
    }

    private static getViewerForArchiveItem(dataContext: TreeNode<ArchiveViewItem>): Viewer<any> {
        if (ObjectHelper.iFrameSafeInstanceOf(dataContext.getData(), ArchiveContentViewItem)) {
            const viewer: Viewer<ContentSummaryAndCompareStatus> = dataContext.getViewer('displayName') ||
                                                                   new ArchiveContentViewer();
            viewer.setObject((<ArchiveContentViewItem>dataContext.getData()).getData());

            return viewer;
        }

        if (ObjectHelper.iFrameSafeInstanceOf(dataContext.getData(), ArchiveBundleViewItem)) {
            const viewer: Viewer<ArchiveBundleViewItem> = dataContext.getViewer('displayName') || new ArchiveBundleViewer();
            viewer.setObject(<ArchiveBundleViewItem>dataContext.getData());
            return viewer;
        }

        return null;
    }
}
