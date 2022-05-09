import {Aggregation} from 'lib-admin-ui/aggregation/Aggregation';
import {AggregationsDisplayNamesResolver} from 'lib-contentstudio/app/browse/filter/AggregationsDisplayNamesResolver';
import {ArchiveAggregation} from './ArchiveAggregation';

export class ArchiveAggregationsDisplayNamesResolver
    extends AggregationsDisplayNamesResolver {

    protected isPrincipalAggregation(aggregation: Aggregation): boolean {
        return super.isPrincipalAggregation(aggregation) || aggregation.getName() === ArchiveAggregation.ARCHIVER;
    }
}
