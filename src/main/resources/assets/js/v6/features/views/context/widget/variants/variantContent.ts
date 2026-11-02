import type {ContentPublishTimesJson, ContentSummaryJson} from '../../../../../../resource/json/ContentSummaryJson';
import {calcPublishStatus, type PublishStatus, type PublishTimes} from '../../../../shared/content/contentStatus';

export type VariantContent = {
    id: string;
    name: string;
    path: string;
    displayName: string;
    type: string;
    iconUrl?: string;
    variantOf?: string;
    publishStatus: PublishStatus;
    publishedOnce: boolean;
};

const toDate = (value: string | null | undefined): Date | undefined => (value ? new Date(value) : undefined);

const toPublishTimes = (json: ContentPublishTimesJson | null | undefined): PublishTimes => ({
    first: toDate(json?.first),
    from: toDate(json?.from),
    to: toDate(json?.to),
    time: toDate(json?.time),
});

export const toVariantContent = (json: ContentSummaryJson): VariantContent => {
    const publish = toPublishTimes(json.publish);

    return {
        id: json.id,
        name: json.name,
        path: json.path,
        displayName: json.displayName,
        type: json.type,
        iconUrl: json.iconUrl ?? undefined,
        variantOf: json.variantOf ?? undefined,
        publishStatus: calcPublishStatus(publish),
        publishedOnce: !!publish.first,
    };
};
