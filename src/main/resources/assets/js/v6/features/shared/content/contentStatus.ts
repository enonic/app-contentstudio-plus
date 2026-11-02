export type PublishStatus = 'ONLINE' | 'PENDING' | 'EXPIRED' | 'OFFLINE';

export type ContentStatusClass =
    | 'online'
    | 'new'
    | 'modified'
    | 'pending'
    | 'expired'
    | 'offline'
    | 'archived'
    | 'moved'
    | 'unknown';

export type PublishTimes = {
    first?: Date;
    from?: Date;
    to?: Date;
    time?: Date;
};

const PUBLISH_STATUSES: readonly PublishStatus[] = ['ONLINE', 'PENDING', 'EXPIRED', 'OFFLINE'];

export const toPublishStatus = (value: string | undefined): PublishStatus =>
    PUBLISH_STATUSES.find(status => status === value) ?? 'OFFLINE';

export const calcPublishStatus = ({from, to}: PublishTimes, now: number = Date.now()): PublishStatus => {
    if (!from) {
        return 'OFFLINE';
    }
    if (from.getTime() > now) {
        return 'PENDING';
    }
    if (to && to.getTime() < now) {
        return 'EXPIRED';
    }
    return 'ONLINE';
};

const PUBLISH_STATUS_KEY: Record<PublishStatus, string> = {
    ONLINE: 'status.online',
    PENDING: 'status.scheduled',
    EXPIRED: 'status.expired',
    OFFLINE: 'status.offline',
};

export const getPublishStatusKey = (status: PublishStatus): string => PUBLISH_STATUS_KEY[status];

export const getPublishedStatusClass = (status: PublishStatus, publishedOnce: boolean): ContentStatusClass => {
    switch (status) {
        case 'ONLINE':
            return 'online';
        case 'PENDING':
            return 'pending';
        case 'EXPIRED':
            return 'expired';
        default:
            return publishedOnce ? 'offline' : 'new';
    }
};
