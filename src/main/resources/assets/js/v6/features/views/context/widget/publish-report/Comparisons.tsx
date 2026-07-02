import type {ContentVersion} from '@enonic/lib-contentstudio/app/ContentVersion';
import {DateHelper} from '@enonic/lib-admin-ui/util/DateHelper';
import {useI18n} from '@enonic/lib-contentstudio/v6/shared/lib/hooks/useI18n';
import {CircleOff} from 'lucide-react';
import {type ReactElement, useMemo} from 'react';
import {buildComparisonPlan} from './comparisonPlan';
import {ComparisonBlock} from './ComparisonBlock';
import {TextAndDate} from './TextAndDate';

const ICON_SIZE = 16;

export type ComparisonsProps = {
    contentId: string;
    versions: ContentVersion[];
    from: Date;
    to: Date;
};

export const Comparisons = ({contentId, versions, from, to}: ComparisonsProps): ReactElement => {
    const plan = useMemo(() => buildComparisonPlan(versions, from, to), [versions, from, to]);

    const noPublishVersionsMsg = useI18n('widget.publishReport.mode.none');
    const noPublishInPeriodMsg = useI18n('widget.publishReport.mode.offline');
    const offlineAfterLabel = useI18n('widget.publishReport.state.offline.after');

    if (plan.mode === 'no-publish-versions') {
        return <div className="px-4 text-sm text-subtle">{noPublishVersionsMsg}</div>;
    }

    if (plan.mode === 'no-publish-in-period') {
        return <div className="px-4 text-sm text-subtle">{noPublishInPeriodMsg}</div>;
    }

    if (plan.mode === 'single-publish') {
        return <ComparisonBlock contentId={contentId} newer={plan.version} />;
    }

    const hasFooter = !!plan.footerOfflineAt;
    const lastItemIndex = plan.items.length - 1;

    return (
        <div className="flex flex-col">
            {plan.headingOfflineAt && (
                <TextAndDate
                    className="border-b border-bdr-subtle px-4 py-3"
                    icon={<CircleOff size={ICON_SIZE} />}
                    entries={[{text: offlineAfterLabel, date: DateHelper.formatDateTime(plan.headingOfflineAt)}]}
                />
            )}
            {plan.items.map((item, index) => (
                <div
                    key={`${item.newer.getId()}-${item.older?.getId() ?? 'single'}-${index}`}
                    className={index < lastItemIndex || hasFooter ? 'border-b border-bdr-subtle' : ''}
                >
                    <ComparisonBlock
                        contentId={contentId}
                        newer={item.newer}
                        older={item.older}
                        offlineFrom={item.offlineFrom}
                    />
                </div>
            ))}
            {plan.footerOfflineAt && (
                <TextAndDate
                    className="px-4 py-3"
                    icon={<CircleOff size={ICON_SIZE} />}
                    entries={[{text: offlineAfterLabel, date: DateHelper.formatDateTime(plan.footerOfflineAt)}]}
                />
            )}
        </div>
    );
};

Comparisons.displayName = 'Comparisons';
