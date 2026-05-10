import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import type {ContentVersion} from '@enonic/lib-contentstudio/app/ContentVersion';
import {ContentId} from '@enonic/lib-contentstudio/app/content/ContentId';
import {DateHelper} from '@enonic/lib-admin-ui/util/DateHelper';
import {useI18n} from '@enonic/lib-contentstudio/v6/features/hooks/useI18n';
import {Checkbox, usePrefixedId} from '@enonic/ui';
import {DiffPatcher} from 'jsondiffpatch';
import {format} from 'jsondiffpatch/formatters/html';
import {CircleCheck, CircleOff, GitCompare} from 'lucide-react';
import {type ReactElement, useEffect, useMemo, useRef, useState} from 'react';
import {fetchVersionContent} from '../../../../api/publish-report';
import {TextAndDate} from './TextAndDate';

const UNCHANGED_HIDDEN_CLASS = 'pr-collapse-unchanged';

const ICON_SIZE = 16;

export type ComparisonBlockProps = {
    contentId: string;
    newer: ContentVersion;
    older?: ContentVersion;
    offlineFrom?: Date;
};

export const ComparisonBlock = ({contentId, newer, older, offlineFrom}: ComparisonBlockProps): ReactElement => {
    const cId = useMemo(() => new ContentId(contentId), [contentId]);
    const [showAll, setShowAll] = useState<boolean>(!older);
    const [diffHtml, setDiffHtml] = useState<string>('');
    const diffRef = useRef<HTMLDivElement>(null);
    const showAllId = usePrefixedId(null, 'pr-show-all-');

    const showEntireLabel = useI18n('field.content.showEntire');
    const onlineLabel = useI18n('widget.publishReport.state.online');
    const compareTitlePart1 = useI18n('widget.publishReport.dateRange.compare.title.part1');
    const compareTitlePart2 = useI18n('widget.publishReport.dateRange.compare.title.part2');
    const compareSubtitle = useI18n('widget.publishReport.dateRange.compare.subtitle');
    const identicalText = useI18n('dialog.compareVersions.versionsIdentical');

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            fetchVersionContent(cId, newer.getId()),
            older ? fetchVersionContent(cId, older.getId()) : Promise.resolve(null),
        ])
            .then(([newerJson, olderJson]) => {
                if (cancelled) return;
                const patcher = new DiffPatcher();
                if (older && olderJson) {
                    const delta = patcher.diff(olderJson, newerJson);
                    setDiffHtml(delta ? format(delta, newerJson) : `<h3>${identicalText}</h3>`);
                } else {
                    setDiffHtml(format({}, newerJson));
                }
            })
            .catch((reason: unknown) => DefaultErrorHandler.handle(reason));

        return () => {
            cancelled = true;
        };
    }, [cId, newer, older, identicalText]);

    useEffect(() => {
        if (!diffRef.current) return;
        diffRef.current.classList.toggle(UNCHANGED_HIDDEN_CLASS, !showAll);
    }, [showAll, diffHtml]);

    const newerDate = DateHelper.formatDateTime(newer.getPublishInfo().getTime());
    const olderDate = older ? DateHelper.formatDateTime(older.getPublishInfo().getTime()) : null;

    return (
        <div className="flex flex-col gap-2.5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                {olderDate ? (
                    <TextAndDate
                        icon={<GitCompare size={ICON_SIZE} />}
                        entries={[
                            {text: compareTitlePart1, date: olderDate},
                            {text: compareTitlePart2, date: newerDate},
                        ]}
                    />
                ) : (
                    <TextAndDate
                        icon={<CircleCheck size={ICON_SIZE} />}
                        entries={[{text: onlineLabel, date: newerDate}]}
                    />
                )}
                {older && (
                    <Checkbox
                        id={showAllId}
                        label={showEntireLabel}
                        checked={showAll}
                        onCheckedChange={(checked) => setShowAll(checked === true)}
                    />
                )}
            </div>
            {offlineFrom && (
                <TextAndDate
                    icon={<CircleOff size={ICON_SIZE} />}
                    entries={[{text: compareSubtitle, date: DateHelper.formatDateTime(offlineFrom)}]}
                />
            )}
            <div
                ref={diffRef}
                className="jsondiffpatch-delta"
                dangerouslySetInnerHTML={{__html: diffHtml}}
            />
        </div>
    );
};

ComparisonBlock.displayName = 'ComparisonBlock';
