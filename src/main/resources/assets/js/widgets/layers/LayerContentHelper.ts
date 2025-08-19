import {CompareStatus} from 'lib-contentstudio/app/content/CompareStatus';
import {ContentSummaryAndCompareStatus} from 'lib-contentstudio/app/content/ContentSummaryAndCompareStatus';
import {PublishStatus} from 'lib-contentstudio/app/publish/PublishStatus';
import {CompareContentResult} from 'lib-contentstudio/app/resource/CompareContentResult';
import {CompareAndPublishStatusJson} from '../../resource/json/CompareAndPublishStatusJson';
import {LayerContentJson} from '../../resource/json/LayerContentJson';
import {LayerContent} from './LayerContent';
import {LibToStudioConverter} from './LibToStudioConverter';

export class LayerContentHelper {

    static jsonToLayerContent(json: LayerContentJson): LayerContent {
        const content = LayerContentHelper.contentAndCompareStatusFromJson(json);
        const project = LibToStudioConverter.convertXPProjectToProject(json.project);

        return new LayerContent(content, project);
    }

    private static contentAndCompareStatusFromJson(json: LayerContentJson): ContentSummaryAndCompareStatus {
        if (!json.item) {
            return null;
        }

        const contentSummary = LibToStudioConverter.convertXPContentToContentSummary(json.item);
        const compareStatusResult = LayerContentHelper.compareStatusFromJson(contentSummary.getId(), json.compareAndPublishStatus);

        return ContentSummaryAndCompareStatus.fromContentAndCompareAndPublishStatus(contentSummary, compareStatusResult.getCompareStatus(),
            compareStatusResult.getPublishStatus());
    }

    private static compareStatusFromJson(id: string, json: CompareAndPublishStatusJson): CompareContentResult {
        const compareStatus: CompareStatus = CompareStatus[json.compareStatus] as CompareStatus;
        const publishStatus: PublishStatus = PublishStatus[json.publishStatus] as PublishStatus;

        return new CompareContentResult(id, compareStatus, publishStatus);
    }
}