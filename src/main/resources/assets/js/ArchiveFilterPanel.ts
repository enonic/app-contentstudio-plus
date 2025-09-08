import {ContentAggregation} from 'lib-contentstudio/app/browse/filter/ContentAggregation';
import {ArchiveResourceRequest} from './resource/ArchiveResourceRequest';
import {ArchiveAggregation} from './ArchiveAggregation';
import {ContentBrowseFilterPanel} from 'lib-contentstudio/app/browse/filter/ContentBrowseFilterPanel';
import {ArchiveAggregationsFetcher} from './ArchiveAggregationsFetcher';
import {ArchiveContentViewItem} from './ArchiveContentViewItem';

export class ArchiveFilterPanel
    extends ContentBrowseFilterPanel<ArchiveContentViewItem> {

    protected aggregationsFetcher: ArchiveAggregationsFetcher;

    protected createAggregationFetcher(): ArchiveAggregationsFetcher {
        const aggregationsFetcher = new ArchiveAggregationsFetcher(this.getAggregationsList());
        aggregationsFetcher.setRootPath(ArchiveResourceRequest.ARCHIVE_PATH);

        return aggregationsFetcher;
    }

    protected isPrincipalAggregation(name: string): boolean {
        return name === ContentAggregation.OWNER.toString() || name === ArchiveAggregation.ARCHIVED_BY.toString();
    }

    protected getAggregationEnum(): Record<string, string> {
        return {
            CONTENT_TYPE: ContentAggregation.CONTENT_TYPE,
            ARCHIVED: ArchiveAggregation.ARCHIVED,
            ARCHIVED_BY: ArchiveAggregation.ARCHIVED_BY,
            OWNER: ContentAggregation.OWNER,
            LANGUAGE: ContentAggregation.LANGUAGE
        };
    }

    protected isExportAllowed(): boolean {
        return false;
    }

    private getAggregationsList(): string[] {
        return Array.from(this.aggregations.keys());
    }
}
