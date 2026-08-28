import {type BucketAggregation} from '@enonic/lib-admin-ui/aggregation/BucketAggregation';
import {AggregationsDisplayNamesResolver} from '@enonic/lib-contentstudio/app/browse/filter/AggregationsDisplayNamesResolver';
import Q from 'q';
import {ArchiveAggregation} from './ArchiveAggregation';

export class ArchiveAggregationsDisplayNamesResolver
    extends AggregationsDisplayNamesResolver {

    updateAggregationsDisplayNames(aggregations: BucketAggregation[]): Q.Promise<void> {
        const archivedByAggregation: BucketAggregation = aggregations.find(
            (aggregation: BucketAggregation) => aggregation.getName() === ArchiveAggregation.ARCHIVED_BY.toString());

        if (!archivedByAggregation) {
            return super.updateAggregationsDisplayNames(aggregations);
        }

        return Q.all([
            super.updateAggregationsDisplayNames(aggregations),
            this.updateUnknownPrincipals(archivedByAggregation).then(() => this.updateKnownPrincipals(archivedByAggregation)),
        ]).thenResolve(null);
    }
}
