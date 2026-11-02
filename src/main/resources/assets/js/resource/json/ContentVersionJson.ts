export interface ContentVersionPublishInfoJson {
    first?: string | null;
    from?: string | null;
    to?: string | null;
    time?: string | null;
}

export interface ContentVersionActionJson {
    operation: string;
    opTime: string;
}

export interface ContentVersionJson {
    id: string;
    timestamp: string;
    publishInfo?: ContentVersionPublishInfoJson | null;
    actions?: ContentVersionActionJson[] | null;
}

export interface ContentVersionsJson {
    contentVersions: ContentVersionJson[];
}
