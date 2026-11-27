import type {ContentSummaryJson} from './ContentSummaryJson';

export interface ArchivedContentJson extends ContentSummaryJson {
    hasChildren: boolean;
    isValid: boolean;
    thumbnail?: unknown;
    attachments?: string[] | null;
    workflow?: {state?: string | null} | null;
    language?: string | null;
    creator?: string | null;
    modifier?: string | null;
    owner?: string | null;
    createdTime?: string | null;
    modifiedTime?: string | null;
    archivedTime?: string | null;
    archivedBy?: string | null;
    originalParentPath?: string | null;
    originalName?: string | null;
}

export interface ArchivedContentListJson {
    items: ArchivedContentJson[];
    total: number;
}
