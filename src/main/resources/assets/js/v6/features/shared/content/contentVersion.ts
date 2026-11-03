import type {
    ContentVersionActionJson,
    ContentVersionJson,
    ContentVersionPublishInfoJson,
} from '../../../../resource/json/ContentVersionJson';

export const PUBLISH_OPERATION = 'content.publish';

export const UNPUBLISH_OPERATION = 'content.unpublish';

export type VersionAction = {
    operation: string;
    opTime: Date;
};

export type VersionPublishInfo = {
    first?: Date;
    from?: Date;
    to?: Date;
    time?: Date;
};

export type ContentVersion = {
    id: string;
    timestamp: Date;
    publishInfo?: VersionPublishInfo;
    actions: VersionAction[];
};

// The version timestamp and `publishInfo.from` come from different clocks on the server.
const SAME_INSTANT_DELTA_MS = 500;

const toDate = (value: string | null | undefined): Date | undefined => (value ? new Date(value) : undefined);

const toPublishInfo = (json: ContentVersionPublishInfoJson, timestamp: Date): VersionPublishInfo => {
    const from = toDate(json.from);
    const isSameInstant = from && Math.abs(from.getTime() - timestamp.getTime()) < SAME_INSTANT_DELTA_MS;

    return {
        first: toDate(json.first),
        from: isSameInstant ? timestamp : from,
        to: toDate(json.to),
        time: toDate(json.time),
    };
};

const toAction = (json: ContentVersionActionJson): VersionAction => ({
    operation: json.operation,
    opTime: new Date(json.opTime),
});

export const toContentVersion = (json: ContentVersionJson): ContentVersion => {
    const timestamp = new Date(json.timestamp);

    return {
        id: json.id,
        timestamp,
        publishInfo: json.publishInfo ? toPublishInfo(json.publishInfo, timestamp) : undefined,
        actions: (json.actions ?? []).map(toAction),
    };
};

export const isPublished = (version: ContentVersion): boolean => !!version.publishInfo?.from;

export const isUnpublished = (version: ContentVersion): boolean => !!version.publishInfo && !version.publishInfo.from;

export const isScheduled = (version: ContentVersion): boolean => {
    const from = version.publishInfo?.from;
    return !!from && from > version.timestamp && from > new Date();
};

export const findAction = (version: ContentVersion, operation: string): VersionAction | undefined =>
    version.actions.find(action => action.operation === operation);
