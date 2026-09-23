import type {ContentVersion} from '@enonic/lib-contentstudio/app/ContentVersion';
import type {ContentVersionAction} from '@enonic/lib-contentstudio/app/ContentVersionAction';
import {ContentOperation} from '@enonic/lib-contentstudio/v6/entities/content/version/versionOperations';

export type ComparisonItem = {
    newer: ContentVersion;
    older?: ContentVersion;
    offlineFrom?: Date;
};

export type ComparisonPlan =
    | {mode: 'no-publish-versions'}
    | {mode: 'no-publish-in-period'}
    | {
          mode: 'comparisons';
          headingOfflineAt?: Date;
          footerOfflineAt?: Date;
          items: ComparisonItem[];
      };

const findAction = (v: ContentVersion, operation: string): ContentVersionAction | undefined =>
    v.getActions().find((a) => a.getOperation() === operation);

const hasActions = (v: ContentVersion): boolean => v.getActions().length > 0;

const isPublishedVersion = (v: ContentVersion): boolean => {
    if (hasActions(v) && !findAction(v, ContentOperation.PUBLISH)) return false;
    return v.hasPublishInfo() && v.isPublished() && !v.isScheduled();
};

const isUnpublishedVersion = (v: ContentVersion): boolean =>
    hasActions(v) ? !!findAction(v, ContentOperation.UNPUBLISH) : v.isUnpublished();

const getVersionTimestamp = (v: ContentVersion): Date => {
    const unpublishTime = findAction(v, ContentOperation.UNPUBLISH)?.getOpTime();
    if (unpublishTime) return unpublishTime;
    return v.hasPublishInfo() && v.getPublishInfo().getTime() ? v.getPublishInfo().getTime() : v.getTimestamp();
};

export function buildComparisonPlan(
    versions: ContentVersion[],
    from: Date,
    to: Date,
): ComparisonPlan {
    const fromMs = from.getTime();
    const toMs = to.getTime();

    let hasAnyPublished = false;
    let lastBeforeTo: {isPublished: boolean; timestamp: Date} | null = null;
    let lastBeforeFrom: {isPublished: boolean; timestamp: Date; version?: ContentVersion} | null = null;
    let totalPublishedWithin = 0;
    let newerVersion: ContentVersion | null = null;
    let offlineInBetween: {timestamp: Date} | null = null;

    const items: ComparisonItem[] = [];

    for (const v of versions) {
        const ts = getVersionTimestamp(v);
        const tsMs = ts.getTime();
        const pub = isPublishedVersion(v);

        if (pub) hasAnyPublished = true;

        if (tsMs > toMs) continue;

        const within = tsMs >= fromMs && tsMs <= toMs;

        if (within) {
            if (pub) {
                totalPublishedWithin++;
                if (lastBeforeTo === null) {
                    lastBeforeTo = {isPublished: true, timestamp: ts};
                }

                if (newerVersion) {
                    items.push({
                        newer: newerVersion,
                        older: v,
                        offlineFrom: offlineInBetween?.timestamp,
                    });
                }
                newerVersion = v;
                offlineInBetween = null;
            } else if (isUnpublishedVersion(v)) {
                if (lastBeforeTo === null) {
                    lastBeforeTo = {isPublished: false, timestamp: ts};
                }
                offlineInBetween = {timestamp: ts};
            }
        } else if (lastBeforeFrom === null) {
            if (pub) {
                lastBeforeFrom = {isPublished: true, timestamp: ts, version: v};
            } else if (isUnpublishedVersion(v)) {
                lastBeforeFrom = {isPublished: false, timestamp: ts};
            }
        }
    }

    if (newerVersion && lastBeforeFrom?.isPublished && lastBeforeFrom.version) {
        items.push({
            newer: newerVersion,
            older: lastBeforeFrom.version,
            offlineFrom: offlineInBetween?.timestamp,
        });
        offlineInBetween = null;
        totalPublishedWithin++;
    }

    if (!hasAnyPublished) return {mode: 'no-publish-versions'};
    if (totalPublishedWithin === 0) return {mode: 'no-publish-in-period'};
    if (totalPublishedWithin === 1 && newerVersion) {
        items.push({newer: newerVersion});
    }

    return {
        mode: 'comparisons',
        headingOfflineAt: lastBeforeTo && !lastBeforeTo.isPublished ? lastBeforeTo.timestamp : undefined,
        footerOfflineAt: offlineInBetween?.timestamp,
        items,
    };
}
