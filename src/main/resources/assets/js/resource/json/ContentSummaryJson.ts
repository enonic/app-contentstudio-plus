export interface ContentPublishTimesJson {
    first?: string | null;
    from?: string | null;
    to?: string | null;
    time?: string | null;
}

export interface ContentSummaryJson {
    id: string;
    name: string;
    displayName: string;
    path: string;
    type: string;
    iconUrl?: string | null;
    publish?: ContentPublishTimesJson | null;
    variantOf?: string | null;
}

export interface ContentListJson {
    contents: ContentSummaryJson[];
}
