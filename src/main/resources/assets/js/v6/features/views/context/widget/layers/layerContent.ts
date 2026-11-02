import type {Content as XPContent} from '@enonic-types/lib-content';
import type {CompareAndPublishStatusJson} from '../../../../../../resource/json/CompareAndPublishStatusJson';
import type {LayerContentJson} from '../../../../../../resource/json/LayerContentJson';

export type CompareStatus = 'NEW' | 'NEWER' | 'OLDER' | 'EQUAL' | 'MOVED' | 'ARCHIVED' | 'UNKNOWN';

export type PublishStatus = 'ONLINE' | 'PENDING' | 'EXPIRED' | 'OFFLINE';

export type LayerProject = {
    name: string;
    displayName?: string;
    language?: string;
    parents: string[];
};

export type LayerItem = {
    id: string;
    name: string;
    path: string;
    displayName: string;
    type: string;
    compareStatus: CompareStatus;
    publishStatus: PublishStatus;
    publishedOnce: boolean;
    dataInherited: boolean;
};

export type LayerContent = {
    project: LayerProject;
    item?: LayerItem;
};

export type LayerStatusClass =
    | 'online'
    | 'new'
    | 'modified'
    | 'pending'
    | 'expired'
    | 'offline'
    | 'archived'
    | 'moved'
    | 'unknown';

const COMPARE_STATUSES: readonly CompareStatus[] = ['NEW', 'NEWER', 'OLDER', 'EQUAL', 'MOVED', 'ARCHIVED', 'UNKNOWN'];

const PUBLISH_STATUSES: readonly PublishStatus[] = ['ONLINE', 'PENDING', 'EXPIRED', 'OFFLINE'];

const toCompareStatus = (value: string | undefined): CompareStatus =>
    COMPARE_STATUSES.find(status => status === value) ?? 'UNKNOWN';

const toPublishStatus = (value: string | undefined): PublishStatus =>
    PUBLISH_STATUSES.find(status => status === value) ?? 'OFFLINE';

const toLayerItem = (content: XPContent, status: CompareAndPublishStatusJson | null | undefined): LayerItem => ({
    id: content._id,
    name: content._name,
    path: content._path,
    displayName: content.displayName,
    type: content.type,
    compareStatus: toCompareStatus(status?.compareStatus),
    publishStatus: toPublishStatus(status?.publishStatus),
    publishedOnce: !!content.publish?.first,
    dataInherited: content.inherit?.includes('CONTENT') ?? false,
});

export const toLayerContent = (json: LayerContentJson): LayerContent => ({
    project: {
        name: json.project.id,
        displayName: json.project.displayName,
        language: json.project.language,
        parents: json.project.parents ?? [],
    },
    item: json.item ? toLayerItem(json.item, json.compareAndPublishStatus) : undefined,
});

export const getMainParent = (project: LayerProject): string | undefined => project.parents[0];

export const isChildOf = (child: LayerProject, parentName: string): boolean => child.parents.includes(parentName);

const COMPARE_STATUS_CLASS: Partial<Record<CompareStatus, LayerStatusClass>> = {
    NEWER: 'modified',
    EQUAL: 'online',
    MOVED: 'moved',
    ARCHIVED: 'archived',
};

export const getStatusClass = ({compareStatus, publishStatus, publishedOnce}: LayerItem): LayerStatusClass => {
    if (publishStatus === 'ONLINE') {
        return 'online';
    }
    if (compareStatus === 'NEW') {
        return publishedOnce ? 'offline' : 'new';
    }
    if (publishStatus === 'PENDING') {
        return 'pending';
    }
    if (publishStatus === 'EXPIRED') {
        return 'expired';
    }
    return COMPARE_STATUS_CLASS[compareStatus] ?? 'unknown';
};

const PUBLISH_STATUS_KEY: Record<PublishStatus, string> = {
    ONLINE: 'status.online',
    PENDING: 'status.scheduled',
    EXPIRED: 'status.expired',
    OFFLINE: 'status.offline',
};

export const getStatusKey = ({publishStatus}: LayerItem): string => PUBLISH_STATUS_KEY[publishStatus];
