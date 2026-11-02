import type {Content as XPContent} from '@enonic-types/lib-content';
import type {CompareAndPublishStatusJson} from '../../../../resource/json/CompareAndPublishStatusJson';
import type {LayerContentJson} from '../../../../resource/json/LayerContentJson';
import {type ContentStatusClass, type PublishStatus, toPublishStatus} from './contentStatus';

export type CompareStatus = 'NEW' | 'NEWER' | 'OLDER' | 'EQUAL' | 'MOVED' | 'ARCHIVED' | 'UNKNOWN';

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

const COMPARE_STATUSES: readonly CompareStatus[] = ['NEW', 'NEWER', 'OLDER', 'EQUAL', 'MOVED', 'ARCHIVED', 'UNKNOWN'];

const toCompareStatus = (value: string | undefined): CompareStatus =>
    COMPARE_STATUSES.find(status => status === value) ?? 'UNKNOWN';

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

const COMPARE_STATUS_CLASS: Partial<Record<CompareStatus, ContentStatusClass>> = {
    NEWER: 'modified',
    EQUAL: 'online',
    MOVED: 'moved',
    ARCHIVED: 'archived',
};

export const getStatusClass = ({compareStatus, publishStatus, publishedOnce}: LayerItem): ContentStatusClass => {
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
