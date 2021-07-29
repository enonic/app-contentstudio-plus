import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {ContentSummary} from 'lib-contentstudio/app/content/ContentSummary';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {GridColumnConfig} from 'lib-admin-ui/ui/grid/GridColumn';
import {DateTimeFormatter} from 'lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {SpanEl} from 'lib-admin-ui/dom/SpanEl';
import {ContentSummaryListViewer} from 'lib-contentstudio/app/content/ContentSummaryListViewer';

export class ArchiveTreeGridHelper {

    static createTreeGridBuilder(): TreeGridBuilder<ContentSummaryAndCompareStatus> {
        return new TreeGridBuilder<ContentSummaryAndCompareStatus>()
            .setColumnConfig(ArchiveTreeGridHelper.createColumnConfig())
            .setPartialLoadEnabled(true)
            .setLoadBufferSize(20)
            .prependClasses('archive-tree-grid');
    }

    static createColumnConfig(): GridColumnConfig[] {
        return [{
            name: 'Name',
            id: 'displayName',
            field: 'contentSummary.displayName',
            formatter: ArchiveTreeGridHelper.nameFormatter,
            style: {cssClass: 'name', minWidth: 130}
        }, {
            name: 'CompareStatus',
            id: 'compareStatus',
            field: 'compareStatus',
            formatter: ArchiveTreeGridHelper.formatStatus,
            style: {cssClass: 'status', minWidth: 75, maxWidth: 75}
        }, {
            name: 'ModifiedTime',
            id: 'modifiedTime',
            field: 'contentSummary.modifiedTime',
            formatter: DateTimeFormatter.format,
            style: {cssClass: 'modified', minWidth: 135, maxWidth: 135}
        }];
    }

    static nameFormatter(_row: number, _cell: number, _value: any, _columnDef: any, node: TreeNode<ContentSummaryAndCompareStatus>) {
        const data: ContentSummaryAndCompareStatus = node.getData();

        if (data.getContentSummary()) {
            let viewer = <ContentSummaryListViewer> node.getViewer('name');
            if (!viewer) {
                viewer = new ContentSummaryListViewer();
                node.setViewer('name', viewer);
            }
            viewer.setIsRelativePath(node.calcLevel() > 1);
            viewer.setObject(node.getData());
            return viewer ? viewer.toString() : '';
        }

        return '';
    }

    static formatStatus({}: any, {}: any, {}: any, {}: any, dataContext: TreeNode<ContentSummaryAndCompareStatus>): string {
        const data: ContentSummaryAndCompareStatus = dataContext.getData();

        return data?.getContentSummary() ? new SpanEl().addClass(data.getStatusClass()).setHtml(data.getStatusText()).toString() : null;
    }
}
